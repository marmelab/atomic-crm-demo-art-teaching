import { CreateBase, Form, useGetIdentity } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import {
  DEFAULT_SESSION_CAPACITY,
  DEFAULT_SESSION_DURATION_MINUTES,
  DEFAULT_SESSION_OVERBOOKING,
} from "../scheduleDefaults";
import { SessionInputs } from "./SessionInputs";

/**
 * Create form for a new session (scheduled class).
 */
export const SessionCreate = () => {
  const { identity } = useGetIdentity();

  // Default starts_at: tomorrow at 10:00 in local time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  return (
    <CreateBase redirect="show">
      <div className="mt-4 max-w-2xl mx-auto">
        <Form
          defaultValues={{
            sales_id: identity?.id,
            starts_at: tomorrow.toISOString(),
            duration_minutes: DEFAULT_SESSION_DURATION_MINUTES,
            capacity: DEFAULT_SESSION_CAPACITY,
            overbooking: DEFAULT_SESSION_OVERBOOKING,
          }}
        >
          <Card>
            <CardContent>
              <SessionInputs />
              <FormToolbar />
            </CardContent>
          </Card>
        </Form>
      </div>
    </CreateBase>
  );
};
