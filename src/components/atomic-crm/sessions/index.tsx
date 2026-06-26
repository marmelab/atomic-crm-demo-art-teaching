import type { SessionSummary } from "../types";
import { SessionCreate } from "./SessionCreate";
import { SessionEdit } from "./SessionEdit";
import { SessionList } from "./SessionList";
import { SessionShow } from "./SessionShow";

export default {
  list: SessionList,
  show: SessionShow,
  edit: SessionEdit,
  create: SessionCreate,
  recordRepresentation: (record: SessionSummary) => {
    const date = new Date(record.starts_at);
    return date.toLocaleString();
  },
};
