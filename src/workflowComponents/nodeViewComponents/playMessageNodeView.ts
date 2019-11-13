import { ActionsManager } from "../../managers/actionsManager";
import { autoinject, bindable, observable } from "aurelia-framework";
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { WorkflowNode } from "../models/workflowNode";
import { PlayMessage } from "../models/playMessage";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";


@autoinject
export class PlayMessageNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable private selectedLeadType: string;

  @bindable @observable private nodeId: string;

  private node: WorkflowNode;

  @bindable private allMessages: any[];

  private chosenMessage: any;

  private actionsManager: ActionsManager;

  constructor(private utility: Utility) {

  }

  attached(): void {
    if (this.allMessages && this.allMessages[0]) {
      this.chosenMessage = this.allMessages[0];
    }
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.PLAY_MESSAGE) {
      this.node = this.workflowManager.getNodeById(newValue);
      this.chosenMessage = this.allMessages[0];
      if (!this.actionsManager) {
        const isCall = this.workflowManager.workflow.type === WorkflowType.CALL;
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), newValue);
      } else {
        this.actionsManager.nodeId = newValue;
        this.actionsManager.allActions = this.workflowManager.getNewActionsFromChildren(newValue);
      }
      if (this.node.extraData) {
        const playMessage = JSON.parse(this.node.extraData) as PlayMessage;
        this.allMessages.forEach(message => {
          if (message.id === playMessage.messageId) {
            this.chosenMessage = message;
          }
        });

      }
    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    if (this.allMessages && this.allMessages[0]) {
      this.chosenMessage = this.allMessages[0];
    }
  }

  private updateWorkflow(): void {
    this.actionsManager.updateWorkflow();
    const playMessageData = JSON.stringify(new PlayMessage(this.chosenMessage.id));
    this.node.extraData = playMessageData;
  }
}
