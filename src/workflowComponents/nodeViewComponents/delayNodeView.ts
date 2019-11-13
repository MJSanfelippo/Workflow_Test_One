import { ActionsManager } from "../../managers/actionsManager";
import { autoinject, observable, bindable } from "aurelia-framework";
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { WorkflowNode } from "../models/workflowNode";
import { Delay } from "../models/delay";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";

@autoinject
export class DelayNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private selectedLeadType: string;

  private node: WorkflowNode;

  @bindable @observable private nodeId: string;

  private actionsManager: ActionsManager;

  private delayTimeInSeconds: number;

  private negativeDelayTimeError: boolean;

  private isIvrAllowed: boolean = true;
  private isHangUpAllowed: boolean = true;

  constructor(private utility: Utility) {
    this.delayTimeInSeconds = 0;
    this.negativeDelayTimeError = false;
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.DELAY) {
      this.node = this.workflowManager.getNodeById(newValue);
      this.delayTimeInSeconds = 0;
      if (!this.actionsManager) {
        const isCall = this.workflowManager.workflow.type === WorkflowType.CALL;
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), newValue);
      } else {
        this.actionsManager.nodeId = newValue;
        this.actionsManager.allActions = this.workflowManager.getNewActionsFromChildren(newValue);
      }
      if (this.node.extraData) {
        const delay = JSON.parse(this.node.extraData) as Delay;
        this.delayTimeInSeconds = delay.delayTimeInSeconds;
      }
    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    if (this.actionsManager) {
      this.actionsManager.allActions = [];
      this.actionsManager.nodeIdsToRemove = [];
      this.actionsManager.nodeId = this.nodeId;
    }
  }

  setNegativeTimeError(): void {
    this.negativeDelayTimeError = true;
    setTimeout(() => {
      this.negativeDelayTimeError = false;
    }, 4000);
  }

  isNegativeTime(): boolean {
    return this.delayTimeInSeconds < 0;
  }

  updateWorkflow(): void {
    this.negativeDelayTimeError = false;
    const negativeTimError = this.isNegativeTime();
    if (negativeTimError) {
      this.setNegativeTimeError();
      return;
    }
    this.actionsManager.updateWorkflow();
    const delayData = JSON.stringify(new Delay(this.delayTimeInSeconds));
    this.node.extraData = delayData;
  }
}
