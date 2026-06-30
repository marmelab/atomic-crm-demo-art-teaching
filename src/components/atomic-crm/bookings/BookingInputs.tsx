import { required, useTranslate } from "ra-core";
import { useWatch } from "react-hook-form";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";

import type { SubscriptionSummary } from "../types";
import { useConfigurationContext } from "../root/ConfigurationContext";

interface BookingInputsProps {
  /** Fixed contact_id — when set the contact field is hidden and prefilled. */
  contactId?: string | number;
}

/**
 * Shared form fields for booking create/edit forms.
 * Renders a ReferenceInput for the contact, a SelectInput for the booking type,
 * and a conditional ReferenceInput for the subscription (only when type === 'subscription').
 * The session_id is handled via the parent form's defaultValues.
 */
export const BookingInputs = ({ contactId }: BookingInputsProps) => {
  const translate = useTranslate();
  const { bookingTypes } = useConfigurationContext();
  const translatedBookingTypes = bookingTypes.map((bt) => ({
    ...bt,
    label: translate(`resources.bookings.type.${bt.value}`, { _: bt.label }),
  }));
  const type = useWatch({ name: "type" });
  // When contactId is fixed (e.g. from SessionShow) use it for subscription filter
  const watchedContactId = useWatch({ name: "contact_id" });
  const effectiveContactId = contactId ?? watchedContactId;

  const formatSubscriptionOption = (record: SubscriptionSummary) => {
    const purchaseDate = record.purchased_at
      ? new Date(record.purchased_at).toLocaleDateString()
      : "";
    return `${record.sessions_remaining} ${translate("resources.subscriptions.fields.sessions_remaining")} (${translate("resources.subscriptions.fields.purchased_at")}: ${purchaseDate})`;
  };

  return (
    <div className="flex flex-col gap-4">
      {!contactId && (
        <ReferenceInput source="contact_id" reference="contacts">
          <AutocompleteInput validate={required()} helperText={false} />
        </ReferenceInput>
      )}
      <SelectInput
        source="type"
        choices={translatedBookingTypes}
        optionText="label"
        optionValue="value"
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
          <AutocompleteInput
            helperText={false}
            optionText={formatSubscriptionOption}
            disabled={!effectiveContactId}
          />
        </ReferenceInput>
      )}
    </div>
  );
};
