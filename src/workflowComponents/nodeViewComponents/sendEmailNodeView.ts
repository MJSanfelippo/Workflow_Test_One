import { ActionsManager } from "../../managers/actionsManager";
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { bindable, observable, autoinject } from "aurelia-framework";
import { WorkflowNode } from "../models/workflowNode";
import { Email } from "../models/email";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { Utility } from "./../../utility";


@autoinject

export class SendEmailNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable @observable private selectedLeadType: string;

  private emailTo: string;
  private emailBody: string;
  private emailSubject: string;

  private noSubjectError: boolean;
  private noBodyError: boolean;
  private invalidEmailToError: boolean;
  private duplicateScheduledActionsError: boolean;

  private node: WorkflowNode;

  @bindable @observable private nodeId: string;

  private actionsManager: ActionsManager;

  constructor(private utility: Utility) {
    this.emailBody = "";
    this.emailSubject = "";
    this.emailTo = "";
    this.noSubjectError = false;
    this.noBodyError = false;
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.SEND_EMAIL) {
      this.node = this.workflowManager.getNodeById(newValue);
      if (!this.actionsManager) {
        const isCall = this.workflowManager.workflow.type === WorkflowType.CALL;
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), newValue);
      } else {
        this.actionsManager.nodeId = newValue;
        this.actionsManager.allActions = this.workflowManager.getNewActionsFromChildren(newValue);
      }
      this.emailBody = "";
      this.emailSubject = "";
      this.emailTo = "";
      if (this.node.extraData) {
        const email = JSON.parse(this.node.extraData) as Email;

        this.emailBody = email.body;
        this.emailSubject = email.subject;
      }

    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    this.emailBody = "";
    this.emailSubject = "";
    this.noSubjectError = false;
    this.noBodyError = false;
    if (this.actionsManager) {
      this.actionsManager.allActions = [];
      this.actionsManager.nodeIdsToRemove = [];
    }
  }

  private setNoSubjectError(): void {
    this.noSubjectError = true;
    setTimeout(() => {
      this.noSubjectError = false;
    }, 4000);
  }

  private setNoBodyError(): void {
    this.noBodyError = true;
    setTimeout(() => {
      this.noBodyError = false;
    }, 4000);
  }

  private isInvalidTo(): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !re.test(this.emailTo.toLowerCase());
  }

  private setInvalidToError(): void {
    this.invalidEmailToError = true;
    setTimeout(() => {
      this.invalidEmailToError = false;
    }, 4000);
  }

  updateWorkflow(): void {

    this.noSubjectError = false;
    this.noBodyError = false;

    const noSubject = this.emailSubject.trim() === "";
    const noBody = this.emailBody.trim() === "";
    const invalidTo = this.isInvalidTo();

    if (noSubject) {
      this.setNoSubjectError();
    }
    if (noBody) {
      this.setNoBodyError();
    }

    if (invalidTo) {
      this.setInvalidToError();
    }

    if (noBody || noSubject || invalidTo) {
      return;
    }

    this.actionsManager.updateWorkflow();

    const email = new Email(this.emailSubject, this.emailBody, this.emailTo);
    const emailData = JSON.stringify(email);
    this.node.extraData = emailData;

  }
}
