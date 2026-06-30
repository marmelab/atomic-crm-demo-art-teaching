import { required } from "ra-core";
import { DateTimeInput } from "@/components/admin/date-time-input";
import { NumberInput } from "@/components/admin/number-input";
import { ReferenceInput } from "@/components/admin/reference-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";
import type { Sale } from "../types";

/** Renders a teacher's full name for the SelectInput option list. */
const saleOptionRenderer = (choice: Sale) =>
  `${choice.first_name} ${choice.last_name}`;

/**
 * Shared form fields for both create and edit session forms.
 * Labels resolve automatically from resources.sessions.fields.* i18n keys.
 */
export const SessionInputs = () => (
  <div className="flex flex-col gap-4">
    <DateTimeInput
      source="starts_at"
      validate={required()}
      helperText={false}
    />
    <NumberInput source="duration_minutes" min={1} helperText={false} />
    <NumberInput source="capacity" min={1} helperText={false} />
    <NumberInput source="overbooking" min={0} helperText={false} />
    <ReferenceInput
      reference="sales"
      source="sales_id"
      sort={{ field: "last_name", order: "ASC" }}
      filter={{ "disabled@neq": true }}
    >
      <SelectInput
        helperText={false}
        optionText={saleOptionRenderer}
        validate={required()}
      />
    </ReferenceInput>
    <TextInput source="notes" multiline helperText={false} />
  </div>
);
