
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { bindable, observable, autoinject } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";
import { ActionsManager } from "../../managers/actionsManager";
import { WorkflowNode } from "../models/workflowNode";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";


@autoinject
export class LeadNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private selectedLeadType: string;

  private tooManyScheduledActionsError: boolean;
  private tooManyRoutingPoliciesError: boolean;
  private tooManyIvrsError: boolean;

  private node: WorkflowNode;

  private actionsManager: ActionsManager;

  @bindable @observable private nodeId: string;

  constructor(private utility: Utility) {
    this.tooManyScheduledActionsError = false;
    this.tooManyRoutingPoliciesError = false;
    this.tooManyIvrsError = false;
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    const type = this.workflowManager.selectedNode.type;
    if (type === WorkflowNodeType.PHONE_CALL || type === WorkflowNodeType.TEXT_MESSAGE || type === WorkflowNodeType.INTERNET || type === WorkflowNodeType.CHAT_MESSAGE) {
      this.node = this.workflowManager.getNodeById(newValue);
      if (!this.actionsManager) {
        const isCall = this.workflowManager.workflow.type === WorkflowType.CALL;
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), newValue);
      } else {
        this.actionsManager.allActions = this.workflowManager.getNewActionsFromChildren(newValue);
        this.actionsManager.nodeId = newValue;
      }
    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    this.tooManyScheduledActionsError = false;
    if (this.actionsManager) {
      this.actionsManager.allActions = [];
      this.actionsManager.nodeIdsToRemove = [];
    }
  }

  updateWorkflow(): void {
    this.actionsManager.updateWorkflow();
  }
}
