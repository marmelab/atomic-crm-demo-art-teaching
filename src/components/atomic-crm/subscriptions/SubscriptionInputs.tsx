import { required } from "ra-core";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { DateInput } from "@/components/admin/date-input";
import { NumberInput } from "@/components/admin/number-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { TextInput } from "@/components/admin/text-input";

/**
 * Shared form fields for both create and edit subscription forms.
 * Labels resolve automatically from resources.subscriptions.fields.* i18n keys.
 * Contact autocomplete uses the contacts resource record representation.
 */
export const SubscriptionInputs = () => (
  <div className="flex flex-col gap-4">
    <ReferenceInput source="contact_id" reference="contacts">
      <AutocompleteInput validate={required()} helperText={false} />
    </ReferenceInput>
    <NumberInput
      source="total_sessions"
      min={1}
      validate={required()}
      helperText={false}
    />
    <DateInput source="purchased_at" validate={required()} helperText={false} />
    <NumberInput source="price" min={0} helperText={false} />
    <TextInput source="notes" multiline helperText={false} />
  </div>
);
