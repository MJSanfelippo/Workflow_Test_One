import { ActionsManager } from "../../managers/actionsManager";
import { autoinject } from "aurelia-dependency-injection";
import { bindable, observable } from "aurelia-framework";
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { WorkflowNode } from "../models/workflowNode";
import { KeyPressAction } from "../models/keyPressAction";
import { IvrData } from "../models/ivrData";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";


@autoinject
export class IvrNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private selectedLeadType: string;
  @bindable private allMessages: any[];
  private selectedMessage: any;

  private node: WorkflowNode;

  @bindable @observable private nodeId: string;

  private numberOfRepeats: number;

  private chosenKeyPresses: KeyPressAction[];

  private keyPressNodeIdsToRemove: string[];

  private actionsManager: ActionsManager;

  private duplicateKeyPressError: boolean;

  constructor(
    private utility: Utility
  ) {
    this.chosenKeyPresses = [];
    this.numberOfRepeats = 0;
    this.duplicateKeyPressError = false;
    this.keyPressNodeIdsToRemove = [];
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.IVR) {
      this.node = this.workflowManager.getNodeById(newValue);
      this.chosenKeyPresses = [];
      this.keyPressNodeIdsToRemove = [];

      this.chosenKeyPresses = this.workflowManager.getNewKeyPressesFromChildren(newValue);

      if (this.node.extraData) {
        const ivrData = JSON.parse(this.node.extraData) as IvrData;
        this.numberOfRepeats = ivrData.numberOfRepeat;

        this.allMessages.forEach(msg => {
          if (msg.id === ivrData.messageId) {
            this.selectedMessage = msg;
          }
        });
      } else {
        this.numberOfRepeats = 0;
        this.selectedMessage = this.allMessages[0];
      }
      const noKeysPressedNode = this.workflowManager.getNoKeysPressedChildFromIvrNode(newValue);

      const isCall = this.workflowManager.workflow.type === WorkflowType.CALL;
      if (noKeysPressedNode) {
        if (!this.actionsManager) {
          this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), noKeysPressedNode.id);
        } else {
          this.actionsManager.nodeId = noKeysPressedNode.id;
          this.actionsManager.allActions = this.workflowManager.getNewActionsFromChildren(noKeysPressedNode.id);
        }
      } else {
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), newValue);
      }
    }
  }

  private updateKeyPressArray(keyPressAction: KeyPressAction, index: number): void {
    this.chosenKeyPresses = this.chosenKeyPresses.slice();
  }

  private addNewKeyPressAction(): void {
    this.chosenKeyPresses.push(new KeyPressAction("", this.utility.generateUUID()));
  }

  private removeKeyPressAction(keyPressActionToRemove: KeyPressAction, index: number): void {
    if (this.workflowManager.getNodeById(keyPressActionToRemove.id)) {
      keyPressActionToRemove.toBeRemoved = true;
      this.keyPressNodeIdsToRemove.push(keyPressActionToRemove.id);
    } else {
      this.chosenKeyPresses.splice(index, 1);
    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    if (this.allMessages) {
      this.selectedMessage = this.allMessages[0];
    }
  }

  isValidKeyPresses(): boolean {
    const setOfKeys: Set<string> = new Set<string>();
    let realLength = 0;
    this.chosenKeyPresses.forEach(key => {
      if (!key.toBeRemoved) {
        realLength++;
        setOfKeys.add(key.keyPress);
      }
    });
    return setOfKeys.size === realLength;
  }

  private setNewKeyPresses(): void {
    const tempKeyPresses: KeyPressAction[] = [];
    for (const chosenKeyPress of this.chosenKeyPresses) {
      if (!chosenKeyPress.toBeRemoved) {
        tempKeyPresses.push(chosenKeyPress);
      }
    }
    this.chosenKeyPresses = tempKeyPresses;

  }

  private updateWorkflow(): void {
    this.duplicateKeyPressError = false;
    const isValid = this.isValidKeyPresses();
    if (!isValid) {
      this.setNoDuplicateKeyPressesError();
      return;
    }
    this.workflowManager.updateIvrKeyPresses(this.nodeId, this.chosenKeyPresses, this.actionsManager.nodeIdsToRemove, this.keyPressNodeIdsToRemove, this.numberOfRepeats, this.actionsManager.allActions);
    this.setNewKeyPresses();
    const ivrData = new IvrData(this.selectedMessage.id, this.numberOfRepeats);
    const ivrDataJson = JSON.stringify(ivrData);
    this.node.extraData = ivrDataJson;
  }
  setNoDuplicateKeyPressesError(): any {
    this.duplicateKeyPressError = true;
    setTimeout(() => {
      this.duplicateKeyPressError = false;
    }, 4000);
  }
}
