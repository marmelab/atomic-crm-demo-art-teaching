import {
  useGetIdentity,
  useNotify,
  useRefresh,
  type Identifier,
} from "ra-core";
import { UserPlus } from "lucide-react";

import { FormDialog } from "../misc/FormDialog";
import { DEFAULT_PACK_SIZE } from "../scheduleDefaults";
import { SubscriptionInputs } from "../subscriptions/SubscriptionInputs";
import { BookingInputs } from "./BookingInputs";
import { isSessionFullError } from "./isSessionFullError";

interface BookingCreateDialogProps {
  /** Pre-filled session id. */
  sessionId: Identifier;
  /** Optional pre-filled contact id. */
  contactId?: Identifier;
}

/**
 * Dialog trigger + form for creating a booking, pre-filled with the session
 * (and optionally the contact). When the capacity guard rejects the create —
 * in either the real backend (trigger) or the demo (FakeRest callback) — the
 * raw message is replaced by a friendly, translated notification.
 */
export const BookingCreateDialog = ({
  sessionId,
  contactId,
}: BookingCreateDialogProps) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();

  const handleError = (error: unknown) => {
    if (isSessionFullError(error)) {
      notify("resources.bookings.notification.session_full", {
        type: "warning",
      });
      return;
    }
    notify("ra.notification.http_error", { type: "error" });
  };

  return (
    <FormDialog
      resource="bookings"
      titleKey="resources.bookings.action.add_student"
      triggerIcon={<UserPlus className="size-4 mr-2" />}
      triggerTestId="add-student-button"
      defaultValues={{
        session_id: sessionId,
        contact_id: contactId,
        status: "booked",
        sales_id: identity?.id,
      }}
      transform={(data) => ({
        ...data,
        session_id: sessionId,
        status: "booked",
        sales_id: identity?.id,
      })}
      onSuccess={() => {
        refresh();
        notify("resources.bookings.action.created", {
          messageArgs: { _: "Booking created" },
        });
      }}
      onError={handleError}
    >
      <BookingInputs contactId={contactId as string | number | undefined} />
    </FormDialog>
  );
};

interface BuyPackDialogProps {
  /** Pre-linked contact id. */
  contactId: Identifier;
}

/**
 * "Buy pack" dialog for creating a subscription from the ContactShow page,
 * pre-linked to the student.
 */
export const BuyPackDialog = ({ contactId }: BuyPackDialogProps) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();

  return (
    <FormDialog
      resource="subscriptions"
      titleKey="resources.subscriptions.action.create"
      triggerLabelKey="resources.bookings.action.buy_pack"
      triggerTestId="buy-pack-button"
      defaultValues={{
        contact_id: contactId,
        total_sessions: DEFAULT_PACK_SIZE,
        purchased_at: new Date().toISOString().split("T")[0],
        sales_id: identity?.id,
      }}
      transform={(data) => ({
        ...data,
        contact_id: contactId,
        sales_id: identity?.id,
      })}
      onSuccess={() => {
        refresh();
        notify("resources.bookings.action.pack_created", {
          messageArgs: { _: "Subscription created" },
        });
      }}
    >
      <SubscriptionInputs />
    </FormDialog>
  );
};
