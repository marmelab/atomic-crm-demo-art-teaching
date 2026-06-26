import { EditBase, Form } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import { SessionInputs } from "./SessionInputs";

/**
 * Edit form for an existing session (scheduled class).
 */
export const SessionEdit = () => (
  <EditBase redirect="show">
    <div className="mt-4 max-w-2xl mx-auto">
      <Form>
        <Card>
          <CardContent>
            <SessionInputs />
            <FormToolbar />
          </CardContent>
        </Card>
      </Form>
    </div>
  </EditBase>
);
