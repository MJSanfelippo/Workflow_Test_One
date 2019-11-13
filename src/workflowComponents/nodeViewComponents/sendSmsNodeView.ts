import { ActionsManager } from "../../managers/actionsManager";
import { PLATFORM } from "aurelia-pal";
import { bindable, observable, autoinject } from "aurelia-framework";
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { WorkflowNode } from "../models/workflowNode";
import { SmsText } from "../models/smsText";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";


@autoinject
export class SendSmsNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private selectedLeadType: string;

  private smsText: string;
  private phoneNumberToSendTo: string;

  private noTextError: boolean;
  private invalidPhoneNumberError: boolean;

  @bindable @observable private nodeId: string;

  private node: WorkflowNode;

  private actionsManager: ActionsManager;

  constructor(private utility: Utility) {
    this.smsText = "";
    this.phoneNumberToSendTo = "";
    this.noTextError = false;
    this.invalidPhoneNumberError = false;
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.SEND_SMS) {
      this.node = this.workflowManager.getNodeById(newValue);
      this.smsText = "";
      this.phoneNumberToSendTo = "";
      if (!this.actionsManager) {
        const isCall = this.workflowManager.workflow.type === WorkflowType.CALL;
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), newValue);
      } else {
        this.actionsManager.nodeId = newValue;
        this.actionsManager.allActions = this.workflowManager.getNewActionsFromChildren(newValue);
      }
      if (this.node.extraData) {
        const sms = JSON.parse(this.node.extraData) as SmsText;
        this.smsText = sms.textToSend;
        this.phoneNumberToSendTo = sms.phoneNumberToSendTo;
      }
    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    this.smsText = "";
    this.noTextError = false;
    if (this.actionsManager) {
      this.actionsManager.allActions = [];
      this.actionsManager.nodeIdsToRemove = [];
    }
  }

  private setNoTextError(): void {
    this.noTextError = true;
    setTimeout(() => {
      this.noTextError = false;
    }, 4500);
  }

  private setInvalidPhoneNumberError(): void {
    this.invalidPhoneNumberError = true;
    setTimeout(() => {
      this.invalidPhoneNumberError = false;
    }, 4000);
  }

  private isInvalidPhoneNumber(): boolean {
    return /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g.test(this.phoneNumberToSendTo);
  }

  private updateWorkflow(): void {
    this.noTextError = false;
    this.invalidPhoneNumberError = false;

    const textError = this.smsText.trim() === "";

    const phoneNumberError = this.isInvalidPhoneNumber();

    if (textError) {
      this.setNoTextError();
    }
    if (!phoneNumberError) {
      this.setInvalidPhoneNumberError();
    }

    if (textError || !phoneNumberError) {
      return;
    }

    this.actionsManager.updateWorkflow();
    const textData = JSON.stringify(new SmsText(this.smsText, this.phoneNumberToSendTo));
    this.node.extraData = textData;
  }
}
