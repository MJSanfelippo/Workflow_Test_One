import { ActionsManager } from "../../managers/actionsManager";
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { bindable, autoinject, observable } from "aurelia-framework";
import { WorkflowNode } from "../models/workflowNode";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";


@autoinject()
export class ScheduleNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private selectedLeadType: string;

  private schedule: any;
  @bindable private allScheduleOptions: any[];

  private node: WorkflowNode;

  @bindable @observable private nodeId: string;

  private actionsManager: ActionsManager;

  constructor(
    private utility: Utility
  ) {
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.REAL_SCHEDULE || this.workflowManager.selectedNode.type === WorkflowNodeType.CATCH_ALL_SCHEDULE) {
      this.node = this.workflowManager.getNodeById(newValue);
      if (!this.actionsManager) {
        const isCall = this.workflowManager.workflow.type === WorkflowType.CALL;
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), newValue);
      } else {
        this.actionsManager.nodeId = newValue;
        this.actionsManager.allActions = this.workflowManager.getNewActionsFromChildren(newValue);
      }
    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    if (this.actionsManager) {
      this.actionsManager.allActions = [];
      this.actionsManager.nodeIdsToRemove = [];
    }
  }

  private updateWorkflow(): void {
    this.actionsManager.updateWorkflow();
  }
}
