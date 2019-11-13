import { bindable, observable, autoinject } from "aurelia-framework";
import { WorkflowManager } from "../../managers/workflowManager";
import { ActionsManager } from "../../managers/actionsManager";
import { WorkflowNode } from "../models/workflowNode";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";


@autoinject
export class HangUpNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private selectedLeadType: string;

  private node: WorkflowNode;

  private actionsManager: ActionsManager;

  @bindable @observable private nodeId: string;

  constructor(private utility: Utility) {
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.HANG_UP) {
      this.node = this.workflowManager.getNodeById(newValue);

      if (!this.actionsManager) {
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(), newValue);
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

  updateWorkflow(): void {
    this.actionsManager.updateWorkflow();
  }
}
