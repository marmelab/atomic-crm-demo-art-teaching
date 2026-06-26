import { useState } from "react";
import {
  CreateBase,
  Form,
  useGetIdentity,
  useNotify,
  useRefresh,
  useTranslate,
  type Identifier,
} from "ra-core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SaveButton } from "@/components/admin/form";
import { UserPlus } from "lucide-react";

import { SubscriptionInputs } from "../subscriptions/SubscriptionInputs";
import { BookingInputs } from "./BookingInputs";

interface BookingCreateDialogProps {
  /** Pre-filled session id. */
  sessionId: Identifier;
  /** Optional pre-filled contact id. */
  contactId?: Identifier;
}

/**
 * Controlled dialog trigger + form for creating a booking.
 * Prefills session_id (and optionally contact_id) from props.
 * When the capacity trigger rejects the create, ra-core maps the Postgres
 * error to a notification — no additional error handling is needed here.
 */
export const BookingCreateDialog = ({
  sessionId,
  contactId,
}: BookingCreateDialogProps) => {
  const [open, setOpen] = useState(false);
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();

  const handleSuccess = () => {
    setOpen(false);
    refresh();
    notify("resources.bookings.action.created", {
      messageArgs: { _: "Booking created" },
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        data-testid="add-student-button"
      >
        <UserPlus className="size-4 mr-2" />
        {translate("resources.bookings.action.add_student")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {translate("resources.bookings.action.add_student")}
            </DialogTitle>
          </DialogHeader>
          <CreateBase
            resource="bookings"
            redirect={false}
            mutationOptions={{ onSuccess: handleSuccess }}
          >
            <Form
              defaultValues={{
                session_id: sessionId,
                contact_id: contactId,
                status: "booked",
                sales_id: identity?.id,
              }}
            >
              <div className="flex flex-col gap-4">
                <BookingInputs
                  contactId={contactId as string | number | undefined}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    {translate("ra.action.cancel")}
                  </Button>
                  <SaveButton
                    transform={(data) => ({
                      ...data,
                      session_id: sessionId,
                      status: "booked",
                      sales_id: identity?.id,
                    })}
                  />
                </div>
              </div>
            </Form>
          </CreateBase>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface BuyPackDialogProps {
  /** Pre-linked contact id. */
  contactId: Identifier;
}

/**
 * "Buy pack" dialog for creating a subscription from the ContactShow page.
 * Opens a dialog with the subscription create form pre-linked to the student.
 */
export const BuyPackDialog = ({ contactId }: BuyPackDialogProps) => {
  const [open, setOpen] = useState(false);
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();

  const handleSuccess = () => {
    setOpen(false);
    refresh();
    notify("resources.bookings.action.pack_created", {
      messageArgs: { _: "Subscription created" },
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        data-testid="buy-pack-button"
      >
        {translate("resources.bookings.action.buy_pack")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {translate("resources.subscriptions.action.create")}
            </DialogTitle>
          </DialogHeader>
          <CreateBase
            resource="subscriptions"
            redirect={false}
            mutationOptions={{ onSuccess: handleSuccess }}
          >
            <Form
              defaultValues={{
                contact_id: contactId,
                total_sessions: 20,
                purchased_at: new Date().toISOString().split("T")[0],
                sales_id: identity?.id,
              }}
            >
              <div className="flex flex-col gap-4">
                <SubscriptionInputs />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    {translate("ra.action.cancel")}
                  </Button>
                  <SaveButton
                    transform={(data) => ({
                      ...data,
                      contact_id: contactId,
                      sales_id: identity?.id,
                    })}
                  />
                </div>
              </div>
            </Form>
          </CreateBase>
        </DialogContent>
      </Dialog>
    </>
  );
};
