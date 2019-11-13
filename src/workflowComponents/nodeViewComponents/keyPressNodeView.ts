import { ActionsManager } from "../../managers/actionsManager";
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { bindable, observable, autoinject } from "aurelia-framework";
import { WorkflowNode } from "../models/workflowNode";
import { KeyPressData } from "../models/keyPressData";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";


@autoinject
export class KeyPressNodeView {
  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private selectedLeadType: string;

  @bindable @observable private nodeId: string;

  private node: WorkflowNode;

  private actionsManager: ActionsManager;

  constructor(private utility: Utility) {
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.KEY_PRESS) {

      this.node = this.workflowManager.getNodeById(newValue);
      this.node.extraData = JSON.stringify(new KeyPressData(this.node.title));
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
    this.node.extraData = JSON.stringify(new KeyPressData(this.node.title));
  }
}
