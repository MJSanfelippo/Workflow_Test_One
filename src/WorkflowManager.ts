import { WorkflowManager as OtherWorkflowManager } from "./managers/workflowManager";
import { singleton } from "aurelia-framework";

@singleton
export class WorkflowManager {

  private idMap: Map<string, OtherWorkflowManager>;

  constructor() {
    this.idMap = new Map<string, OtherWorkflowManager>();
  }

  addToList(id: string, wfm: OtherWorkflowManager) {
    if (id == null) {
      throw new Error("Cannot add undefined id");
    }
    if (this.idMap.has(id)) {
      throw new Error(`Cannot add duplicate id to the list: ${id}`);
    }
    if (wfm == null) {
      throw new Error("Cannot add an undefined wfm");
    }
    this.idMap.set(id, wfm);
  }

  removeFromList(id: string) {
    if (id == null) {
      throw new Error("Cannot delete an undefined key");
    }
    this.idMap.delete(id);
  }
}
