import { EditBase, Form } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import { SubscriptionInputs } from "./SubscriptionInputs";

/**
 * Edit form for an existing subscription (prepaid session pack).
 */
export const SubscriptionEdit = () => (
  <EditBase redirect="show">
    <div className="mt-4 max-w-2xl mx-auto">
      <Form>
        <Card>
          <CardContent>
            <SubscriptionInputs />
            <FormToolbar />
          </CardContent>
        </Card>
      </Form>
    </div>
  </EditBase>
);
