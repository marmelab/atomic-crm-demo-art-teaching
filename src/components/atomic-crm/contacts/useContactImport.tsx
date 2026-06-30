import { useDataProvider, useGetIdentity } from "ra-core";
import { useCallback } from "react";

export type ContactImportSchema = {
  first_name: string;
  last_name: string;
  gender: string;
  email_work: string;
  email_home: string;
  email_other: string;
  phone_work: string;
  phone_home: string;
  phone_other: string;
  background: string;
  avatar: string;
  first_seen: string;
  last_seen: string;
  has_newsletter: string;
  linkedin_url: string;
};

export function useContactImport() {
  const today = new Date().toISOString();
  const user = useGetIdentity();
  const dataProvider = useDataProvider();

  const processBatch = useCallback(
    async (batch: ContactImportSchema[]) => {
      await Promise.all(
        batch.map(
          async ({
            first_name,
            last_name,
            gender,
            email_work,
            email_home,
            email_other,
            phone_work,
            phone_home,
            phone_other,
            background,
            first_seen,
            last_seen,
            has_newsletter,
            linkedin_url,
          }) => {
            const email_jsonb = [
              { email: email_work, type: "Work" },
              { email: email_home, type: "Home" },
              { email: email_other, type: "Other" },
            ].filter(({ email }) => email);
            const phone_jsonb = [
              { number: phone_work, type: "Work" },
              { number: phone_home, type: "Home" },
              { number: phone_other, type: "Other" },
            ].filter(({ number }) => number);

            return dataProvider.create("contacts", {
              data: {
                first_name,
                last_name,
                gender,
                email_jsonb,
                phone_jsonb,
                background,
                first_seen: first_seen
                  ? new Date(first_seen).toISOString()
                  : today,
                last_seen: last_seen
                  ? new Date(last_seen).toISOString()
                  : today,
                has_newsletter,
                sales_id: user?.identity?.id,
                linkedin_url,
              },
            });
          },
        ),
      );
    },
    [dataProvider, user?.identity?.id, today],
  );

  return processBatch;
}
