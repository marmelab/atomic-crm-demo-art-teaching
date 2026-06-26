import {
  withLifecycleCallbacks,
  type CreateParams,
  type Identifier,
  type ResourceCallbacks,
  type UpdateParams,
} from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";

import type {
  Booking,
  Contact,
  ContactNote,
  Sale,
  SalesFormData,
  SignUpData,
  Task,
} from "../../types";
import { recomputeBookingSummaries } from "./bookingSummaries";
import type { ConfigurationContextValue } from "../../root/ConfigurationContext";
import { getActivityLog } from "../commons/activity";
import { getContactAvatar } from "../commons/getContactAvatar";
import { mergeContacts } from "../commons/mergeContacts";
import type { CrmDataProvider } from "../types";
import {
  authProvider as defaultAuthProvider,
  USER_STORAGE_KEY,
} from "./authProvider";
import generateData from "./dataGenerator";
import type { Db } from "./dataGenerator/types";
import { withSupabaseFilterAdapter } from "./internal/supabaseAdapter";

const TASK_MARKED_AS_DONE = "TASK_MARKED_AS_DONE";
const TASK_MARKED_AS_UNDONE = "TASK_MARKED_AS_UNDONE";
const TASK_DONE_NOT_CHANGED = "TASK_DONE_NOT_CHANGED";

async function processContactAvatar(
  params: UpdateParams<Contact>,
): Promise<UpdateParams<Contact>>;

async function processContactAvatar(
  params: CreateParams<Contact>,
): Promise<CreateParams<Contact>>;

async function processContactAvatar(
  params: CreateParams<Contact> | UpdateParams<Contact>,
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
  const { data } = params;
  if (data.avatar?.src || !data.email_jsonb || !data.email_jsonb.length) {
    return params;
  }
  const avatarUrl = await getContactAvatar(data);

  // Clone the data and modify the clone
  const newData = { ...data, avatar: { src: avatarUrl || undefined } };

  return { ...params, data: newData };
}

export interface CreateFakeRestDataProviderOptions {
  db?: Db;
  latency?: number;
  authProvider?: Pick<typeof defaultAuthProvider, "getIdentity">;
  silent?: boolean;
}

const processConfigLogo = async (logo: any): Promise<string> => {
  if (typeof logo === "string") return logo;
  if (logo?.rawFile instanceof File) {
    return (await convertFileToBase64(logo)) as string;
  }
  return logo?.src ?? "";
};

const preserveAttachmentMimeType = <
  NoteType extends { attachments?: Array<{ rawFile?: File; type?: string }> },
>(
  note: NoteType,
): NoteType => ({
  ...note,
  attachments: (note.attachments ?? []).map((attachment) => ({
    ...attachment,
    type: attachment.type ?? attachment.rawFile?.type,
  })),
});

export const createDataProvider = ({
  db = generateData(),
  latency = 300,
  authProvider,
  silent = false,
}: CreateFakeRestDataProviderOptions = {}): CrmDataProvider => {
  const baseDataProvider = fakeRestDataProvider(db, !silent, latency);
  let taskUpdateType = TASK_DONE_NOT_CHANGED;
  const getIdentity = async () =>
    authProvider?.getIdentity?.() ?? defaultAuthProvider.getIdentity?.();

  const dataProviderWithCustomMethod: CrmDataProvider = {
    ...baseDataProvider,
    async getList(resource: string, params: any) {
      if (resource === "activity_log") {
        const { filter = {}, pagination } = params;
        const all = await getActivityLog(
          withSupabaseFilterAdapter(baseDataProvider),
          filter.sales_id,
        );
        const { page, perPage } = pagination;
        const start = (page - 1) * perPage;
        return { data: all.slice(start, start + perPage), total: all.length };
      }
      if (resource === "subscriptions") {
        return baseDataProvider.getList("subscriptions_summary", params);
      }
      if (resource === "sessions") {
        return baseDataProvider.getList("sessions_summary", params);
      }
      return baseDataProvider.getList(resource, params);
    },
    async getOne(resource: string, params: any) {
      if (resource === "subscriptions") {
        return baseDataProvider.getOne("subscriptions_summary", params);
      }
      if (resource === "sessions") {
        return baseDataProvider.getOne("sessions_summary", params);
      }
      return baseDataProvider.getOne(resource, params);
    },
    signUp: async ({
      email,
      password,
      first_name,
      last_name,
    }: SignUpData): Promise<{
      id: string;
      email: string;
      password: string;
    }> => {
      const user = await baseDataProvider.create("sales", {
        data: {
          email,
          first_name,
          last_name,
        },
      });

      return {
        ...user.data,
        password,
      };
    },
    salesCreate: async ({ ...data }: SalesFormData): Promise<Sale> => {
      const response = await dataProvider.create("sales", {
        data: {
          ...data,
          password: "new_password",
        },
      });

      return response.data;
    },
    salesUpdate: async (
      id: Identifier,
      data: Partial<Omit<SalesFormData, "password">>,
    ): Promise<Sale> => {
      const { data: previousData } = await dataProvider.getOne<Sale>("sales", {
        id,
      });

      if (!previousData) {
        throw new Error("User not found");
      }

      const { data: sale } = await dataProvider.update<Sale>("sales", {
        id,
        data,
        previousData,
      });
      return { ...sale, user_id: sale.id.toString() };
    },
    isInitialized: async (): Promise<boolean> => {
      const sales = await dataProvider.getList<Sale>("sales", {
        filter: {},
        pagination: { page: 1, perPage: 1 },
        sort: { field: "id", order: "ASC" },
      });
      if (sales.data.length === 0) {
        return false;
      }
      return true;
    },
    updatePassword: async (id: Identifier): Promise<true> => {
      const currentUser = await getIdentity();
      if (!currentUser) {
        throw new Error("User not found");
      }
      const { data: previousData } = await dataProvider.getOne<Sale>("sales", {
        id: currentUser.id,
      });

      if (!previousData) {
        throw new Error("User not found");
      }

      await dataProvider.update("sales", {
        id,
        data: {
          password: "demo_newPassword",
        },
        previousData,
      });

      return true;
    },
    mergeContacts: async (sourceId: Identifier, targetId: Identifier) => {
      return mergeContacts(sourceId, targetId, baseDataProvider);
    },
    getConfiguration: async (): Promise<ConfigurationContextValue> => {
      const { data } = await baseDataProvider.getOne("configuration", {
        id: 1,
      });
      return (data?.config as ConfigurationContextValue) ?? {};
    },
    updateConfiguration: async (
      config: ConfigurationContextValue,
    ): Promise<ConfigurationContextValue> => {
      const { data: prev } = await baseDataProvider.getOne("configuration", {
        id: 1,
      });
      await baseDataProvider.update("configuration", {
        id: 1,
        data: { config },
        previousData: prev,
      });
      return config;
    },
  };

  const dataProvider = withLifecycleCallbacks(
    withSupabaseFilterAdapter(dataProviderWithCustomMethod),
    [
      {
        resource: "configuration",
        beforeUpdate: async (params) => {
          const config = params.data.config;
          if (config) {
            config.lightModeLogo = await processConfigLogo(
              config.lightModeLogo,
            );
            config.darkModeLogo = await processConfigLogo(config.darkModeLogo);
          }
          return params;
        },
      },
      {
        resource: "sales",
        beforeCreate: async (params) => {
          const { data } = params;
          // If administrator role is not set, we simply set it to false
          if (data.administrator == null) {
            data.administrator = false;
          }
          return params;
        },
        afterSave: async (data) => {
          // Since the current user is stored in localStorage in fakerest authProvider
          // we need to update it to keep information up to date in the UI
          const currentUser = await getIdentity();
          if (currentUser?.id === data.id) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
          }
          return data;
        },
        beforeDelete: async (params) => {
          if (params.meta?.identity?.id == null) {
            throw new Error("Identity MUST be set in meta");
          }

          const newSaleId = params.meta.identity.id as Identifier;

          const [contacts, contactNotes] = await Promise.all([
            dataProvider.getList("contacts", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
            dataProvider.getList("contact_notes", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
          ]);

          await Promise.all([
            dataProvider.updateMany("contacts", {
              ids: contacts.data.map((contact) => contact.id),
              data: {
                sales_id: newSaleId,
              },
            }),
            dataProvider.updateMany("contact_notes", {
              ids: contactNotes.data.map((note) => note.id),
              data: {
                sales_id: newSaleId,
              },
            }),
          ]);

          return params;
        },
      } satisfies ResourceCallbacks<Sale>,
      {
        resource: "contacts",
        beforeCreate: async (createParams) => {
          const params = {
            ...createParams,
            data: {
              ...createParams.data,
              first_seen:
                createParams.data.first_seen ?? new Date().toISOString(),
              last_seen:
                createParams.data.last_seen ?? new Date().toISOString(),
            },
          };
          return processContactAvatar(params);
        },
        beforeUpdate: async (params) => {
          return processContactAvatar(params);
        },
      } satisfies ResourceCallbacks<Contact>,
      {
        resource: "tasks",
        afterCreate: async (result, dataProvider) => {
          // update the task count in the related contact
          const { contact_id } = result.data;
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          await dataProvider.update("contacts", {
            id: contact_id,
            data: {
              nb_tasks: (contact.nb_tasks ?? 0) + 1,
            },
            previousData: contact,
          });
          return result;
        },
        beforeUpdate: async (params) => {
          const { data, previousData } = params;
          if (previousData.done_date !== data.done_date) {
            taskUpdateType = data.done_date
              ? TASK_MARKED_AS_DONE
              : TASK_MARKED_AS_UNDONE;
          } else {
            taskUpdateType = TASK_DONE_NOT_CHANGED;
          }
          return params;
        },
        afterUpdate: async (result, dataProvider) => {
          // update the contact: if the task is done, decrement the nb tasks, otherwise increment it
          const { contact_id } = result.data;
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          if (taskUpdateType !== TASK_DONE_NOT_CHANGED) {
            await dataProvider.update("contacts", {
              id: contact_id,
              data: {
                nb_tasks:
                  taskUpdateType === TASK_MARKED_AS_DONE
                    ? (contact.nb_tasks ?? 0) - 1
                    : (contact.nb_tasks ?? 0) + 1,
              },
              previousData: contact,
            });
          }
          return result;
        },
        afterDelete: async (result, dataProvider) => {
          // update the task count in the related contact
          const { contact_id } = result.data;
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          await dataProvider.update("contacts", {
            id: contact_id,
            data: {
              nb_tasks: (contact.nb_tasks ?? 0) - 1,
            },
            previousData: contact,
          });
          return result;
        },
      } satisfies ResourceCallbacks<Task>,
      {
        resource: "contact_notes",
        beforeSave: async (params) => preserveAttachmentMimeType(params),
      } satisfies ResourceCallbacks<ContactNote>,
      {
        // Keep subscriptions_summary in sync with subscriptions for FakeRest demo.
        // In Supabase, this is a DB view; here we mirror it manually.
        resource: "subscriptions",
        afterCreate: async (result) => {
          const { id, ...rest } = result.data;
          await baseDataProvider.create("subscriptions_summary", {
            data: {
              ...rest,
              id,
              sessions_used: 0,
              sessions_remaining: rest.total_sessions ?? 0,
            },
          });
          return result;
        },
        afterUpdate: async (result) => {
          const { id, ...rest } = result.data;
          const { data: prev } = await baseDataProvider.getOne(
            "subscriptions_summary",
            { id },
          );
          await baseDataProvider.update("subscriptions_summary", {
            id,
            data: {
              ...rest,
              sessions_remaining:
                (rest.total_sessions ?? 0) - (prev?.sessions_used ?? 0),
            },
            previousData: prev,
          });
          return result;
        },
        afterDelete: async (result) => {
          await baseDataProvider.delete("subscriptions_summary", {
            id: result.data.id,
            previousData: result.data,
          });
          return result;
        },
      },
      {
        // Keep sessions_summary in sync with sessions for FakeRest demo.
        // In Supabase, this is a DB view; here we mirror it manually.
        // nb_booked / nb_attended are maintained by the bookings callback below.
        resource: "sessions",
        afterCreate: async (result) => {
          const { id, ...rest } = result.data;
          await baseDataProvider.create("sessions_summary", {
            data: { ...rest, id, nb_booked: 0, nb_attended: 0 },
          });
          return result;
        },
        afterUpdate: async (result) => {
          const { id, ...rest } = result.data;
          const { data: prev } = await baseDataProvider.getOne(
            "sessions_summary",
            { id },
          );
          await baseDataProvider.update("sessions_summary", {
            id,
            data: {
              ...rest,
              nb_booked: prev?.nb_booked ?? 0,
              nb_attended: prev?.nb_attended ?? 0,
            },
            previousData: prev,
          });
          return result;
        },
        afterDelete: async (result) => {
          await baseDataProvider.delete("sessions_summary", {
            id: result.data.id,
            previousData: result.data,
          });
          return result;
        },
      },
      {
        // Booking is the core flow of the app. In Supabase the capacity check
        // is a trigger and the summaries are views; for the FakeRest demo we
        // enforce capacity here and recompute every affected summary so the
        // session badge, pack balance and monthly recap stay live without a
        // page reload.
        resource: "bookings",
        beforeCreate: async (params) => {
          if (params.data.status === "cancelled") return params;
          const sessionId = params.data.session_id;
          const [{ data: session }, { data: bookings }] = await Promise.all([
            baseDataProvider.getOne("sessions", { id: sessionId }),
            baseDataProvider.getList("bookings", {
              filter: { session_id: sessionId },
              pagination: { page: 1, perPage: 10_000 },
              sort: { field: "id", order: "ASC" },
            }),
          ]);
          const live = bookings.filter(
            (b: Booking) => b.status !== "cancelled",
          ).length;
          if (live >= session.capacity + session.overbooking) {
            // Message mirrors the Postgres trigger so the create dialog's
            // friendly error mapping works in both demo and real backends.
            throw new Error(
              `Session ${sessionId} is fully booked (capacity=${session.capacity}, overbooking=${session.overbooking})`,
            );
          }
          return params;
        },
        afterCreate: async (result) => {
          await recomputeBookingSummaries(baseDataProvider, result.data);
          return result;
        },
        afterUpdate: async (result) => {
          await recomputeBookingSummaries(baseDataProvider, result.data);
          return result;
        },
        afterDelete: async (result) => {
          await recomputeBookingSummaries(baseDataProvider, result.data);
          return result;
        },
      } satisfies ResourceCallbacks<Booking>,
    ],
  ) as CrmDataProvider;

  return dataProvider;
};

export const dataProvider = createDataProvider();

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of dataprovider decoration.
 */
const convertFileToBase64 = (file: { rawFile: Blob }): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    // We know result is a string as we used readAsDataURL
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file.rawFile);
  });
