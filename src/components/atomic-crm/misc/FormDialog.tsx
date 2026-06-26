import { useState, type ReactNode } from "react";
import { CreateBase, Form, useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SaveButton } from "@/components/admin/form";

interface FormDialogProps {
  /** Resource to create the record on. */
  resource: string;
  /** i18n key for the trigger button and the dialog title. */
  titleKey: string;
  /** i18n key for the trigger button label (defaults to titleKey). */
  triggerLabelKey?: string;
  /** Optional icon rendered before the trigger label. */
  triggerIcon?: ReactNode;
  /** data-testid for the trigger button. */
  triggerTestId?: string;
  /** Initial form values. */
  defaultValues: Record<string, unknown>;
  /** Mutates the submitted data before save (e.g. re-pin foreign keys). */
  transform?: (data: Record<string, unknown>) => Record<string, unknown>;
  /** Called after a successful create (the dialog already closes itself). */
  onSuccess?: () => void;
  /**
   * Called when the create fails. Providing this suppresses ra-core's default
   * error notification, so the handler is responsible for all user feedback.
   */
  onError?: (error: unknown) => void;
  /** The resource inputs rendered inside the form. */
  children: ReactNode;
}

/**
 * A controlled dialog wrapping a create form. Owns its open state, renders a
 * trigger button, and closes on success. Shared by the booking and pack
 * creation flows, which differ only in resource, inputs, and defaults.
 */
export const FormDialog = ({
  resource,
  titleKey,
  triggerLabelKey,
  triggerIcon,
  triggerTestId,
  defaultValues,
  transform,
  onSuccess,
  onError,
  children,
}: FormDialogProps) => {
  const [open, setOpen] = useState(false);
  const translate = useTranslate();

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        data-testid={triggerTestId}
      >
        {triggerIcon}
        {translate(triggerLabelKey ?? titleKey)}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{translate(titleKey)}</DialogTitle>
          </DialogHeader>
          <CreateBase
            resource={resource}
            redirect={false}
            mutationOptions={{ onSuccess: handleSuccess, onError }}
          >
            <Form defaultValues={defaultValues}>
              <div className="flex flex-col gap-4">
                {children}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    {translate("ra.action.cancel")}
                  </Button>
                  <SaveButton transform={transform} />
                </div>
              </div>
            </Form>
          </CreateBase>
        </DialogContent>
      </Dialog>
    </>
  );
};
