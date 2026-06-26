import { required } from "ra-core";
import { useWatch } from "react-hook-form";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";

import { useConfigurationContext } from "../root/ConfigurationContext";

interface BookingInputsProps {
  /** Fixed session_id — when set the session field is hidden and prefilled. */
  sessionId?: string | number;
  /** Fixed contact_id — when set the contact field is hidden and prefilled. */
  contactId?: string | number;
}

/**
 * Shared form fields for booking create/edit forms.
 * Renders a ReferenceInput for the contact, a SelectInput for the booking type,
 * and a conditional ReferenceInput for the subscription (only when type === 'subscription').
 */
export const BookingInputs = ({
  sessionId,
  contactId,
}: BookingInputsProps) => {
  const { bookingTypes } = useConfigurationContext();
  const type = useWatch({ name: "type" });
  // When contactId is fixed (e.g. from SessionShow) use it for subscription filter
  const watchedContactId = useWatch({ name: "contact_id" });
  const effectiveContactId = contactId ?? watchedContactId;

  return (
    <div className="flex flex-col gap-4">
      {!contactId && (
        <ReferenceInput source="contact_id" reference="contacts">
          <AutocompleteInput validate={required()} helperText={false} />
        </ReferenceInput>
      )}
      <SelectInput
        source="type"
        choices={bookingTypes}
        validate={required()}
        helperText={false}
      />
      {type === "subscription" && (
        <ReferenceInput
          source="subscription_id"
          reference="subscriptions"
          filter={
            effectiveContactId
              ? {
                  "contact_id@eq": effectiveContactId,
                  "sessions_remaining@gt": 0,
                }
              : { "sessions_remaining@gt": 0 }
          }
        >
          <AutocompleteInput helperText={false} />
        </ReferenceInput>
      )}
    </div>
  );
};
