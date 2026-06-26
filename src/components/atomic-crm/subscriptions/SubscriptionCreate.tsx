import { CreateBase, Form, useGetIdentity } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import { SubscriptionInputs } from "./SubscriptionInputs";

/**
 * Create form for a new subscription (prepaid session pack).
 */
export const SubscriptionCreate = () => {
  const { identity } = useGetIdentity();

  return (
    <CreateBase redirect="show">
      <div className="mt-4 max-w-2xl mx-auto">
        <Form
          defaultValues={{
            sales_id: identity?.id,
            total_sessions: 20,
            purchased_at: new Date().toISOString().split("T")[0],
          }}
        >
          <Card>
            <CardContent>
              <SubscriptionInputs />
              <FormToolbar />
            </CardContent>
          </Card>
        </Form>
      </div>
    </CreateBase>
  );
};
