import { WorkflowManager } from "./../../managers/workflowManager";
import { bindable, observable } from "aurelia-framework";
import { ActionsManager } from "../../managers/actionsManager";

export class AllActions {

  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private nodeId: string;
  @bindable private actionsManager: ActionsManager;
  @bindable @observable private selectedLeadTpe: string;

  
  constructor() {
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    this.actionsManager.allActions = [];
    this.actionsManager.nodeIdsToRemove = [];
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.actionsManager) {
      this.actionsManager.nodeIdsToRemove = [];
    }
  }
}
