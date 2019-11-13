import { WorkflowNodeType } from "../enums/workflowNodeType";
import { WorkflowError } from "./error";
import * as _ from "lodash";

export class WorkflowNode {
  id: string;
  title: string;
  parentNodeIds: string[];
  disabled: boolean;
  type: WorkflowNodeType;
  extraData: string; // json data, can be whatever

  // Below are properties for error/validation handling
  private _index;
  private _ivrNodeCount: number;
  private _rpNodeCount: number;
  private routingPolicyNodeCount: number;
  private _ivrNodeIndices: number[];
  private _rpNodeIndices: number[];
  private routingPolicyNodeIds: string[];
  private errors: WorkflowError[];
  
  private _ivr_or_rp_NodeCount: number;
  private mermaidDivId: string;

  public get ivrNodeCount(): number { return this._ivrNodeCount; }
  public get rpNodeCount(): number { return this._rpNodeCount; }
  public get ivr_or_rp_NodeCount(): number { return this._ivr_or_rp_NodeCount; }
  public get index(): number { return this._index; }
  public get ivrNodeIndices(): number[] { return this._ivrNodeIndices; }
  public get rpNodeIndices(): number[] { return this._rpNodeIndices; }
  public get isDecisionNode(): boolean { return this.type === WorkflowNodeType.IVR || this.type === WorkflowNodeType.SCHEDULED_ACTIONS; }
  public get isErrors(): boolean {
    if (this.errors) {
      return this.errors.length > 0;
    } else {
      return false;
    }
  }

  constructor(id: string, title: string, parentNodeIds: string[], type: WorkflowNodeType, mermaidDivId: string,
    disabled: boolean = false, extraData: string = ""
  ) {
    this.id = id;
    this.title = title;
    this.parentNodeIds = parentNodeIds;
    this.type = type;
    this.mermaidDivId = mermaidDivId;
    this.disabled = disabled;
    this.extraData = extraData;
  }

  public addToIVRNodeIndicesWithoutIncrement(childNodeIndex: number): void {
    this._ivrNodeIndices.push(childNodeIndex);
  }

  public addToRPNodeIndiciesWithoutIncrement(childNodeIndex: number): void {
    this._rpNodeIndices.push(childNodeIndex);
  }

  public addError(error: WorkflowError): void {

    if (!_.some(this.errors, { type: error.type })) {
      this.errors.push(error);
    }
  }

  public addToIVRNodeIndices(childNodeIndex: number): void {

    if (this._ivrNodeCount < 1 || !this.isDecisionNode) {
      this._ivrNodeCount += 1;
    }

    this._ivrNodeIndices.push(childNodeIndex);
  }

  public addToIVR_Or_RP(childNodeIndex: number): void {

    if (this.rpNodeCount > 0 && (this._ivr_or_rp_NodeCount < 1 || !this.isDecisionNode)) {
      this._rpNodeCount -= 1;
      this._ivr_or_rp_NodeCount += 1;
    }

    this._ivrNodeIndices.push(childNodeIndex);

  }

  public addToRP_Or_IVR(childNodeIndex: number): void {

    if (this._ivrNodeCount > 0 && (this._ivr_or_rp_NodeCount < 1 || !this.isDecisionNode)) {
      this._ivrNodeCount -= 1;
      this._ivr_or_rp_NodeCount += 1;
    }

    this._rpNodeIndices.push(childNodeIndex);
  }

  public addToRPNodeIndices(childNodeIndex: number): void {

    if (this._rpNodeCount < 1 || !this.isDecisionNode) {
      this._rpNodeCount += 1;
    }

    this._rpNodeIndices.push(childNodeIndex);
  }

  public resetErrors(indexOfNode: number): void {
    this._index = indexOfNode;
    this._ivrNodeCount = 0;
    this._rpNodeCount = 0;
    this.routingPolicyNodeCount = 0;
    this._ivr_or_rp_NodeCount = 0;

    if (!this.errors) {
      this.errors = [];
    }
    else {
      this.errors.splice(0, this.errors.length);
    }

    if (!this._ivrNodeIndices) {
      this._ivrNodeIndices = [];
    }
    else {
      this._ivrNodeIndices.splice(0, this._ivrNodeIndices.length);
    }

    if (!this._rpNodeIndices) {
      this._rpNodeIndices = [];
    }
    else {
      this._rpNodeIndices.splice(0, this._rpNodeIndices.length);
    }

    if (!this.routingPolicyNodeIds) {
      this.routingPolicyNodeIds = [];
    }
    else {
      this.routingPolicyNodeIds.splice(0, this.routingPolicyNodeIds.length);
    }
  }

  toMermaidDSL(): string {
    let dsl = "";
    switch (this.type) {
      case WorkflowNodeType.INTERNET: {
        dsl += this.internetToDsl();
        break;
      }
      case WorkflowNodeType.CHAT_MESSAGE: {
        dsl += this.chatMessageToDsl();
        break;
      }
      case WorkflowNodeType.TEXT_MESSAGE: {
        dsl += this.textMessageToDsl();
        break;
      }
      case WorkflowNodeType.PHONE_CALL: {
        dsl += this.phoneCallToDsl();
        break;
      }
      case WorkflowNodeType.START: {
        dsl += this.startToDsl();
        break;
      }
      case WorkflowNodeType.DELAY: {
        dsl += this.delayToDsl();
        break;
      }
      case WorkflowNodeType.SEND_EMAIL: {
        dsl += this.sendEmailToDsl();
        break;
      }
      case WorkflowNodeType.SEND_SMS: {
        dsl += this.sendSmsToDsl();
        break;
      }
      case WorkflowNodeType.SCHEDULED_ACTIONS: {
        dsl += this.scheduledActionsToDsl();
        break;
      }
      case WorkflowNodeType.REAL_SCHEDULE: {
        dsl += this.realScheduleToDsl();
        break;
      }
      case WorkflowNodeType.CATCH_ALL_SCHEDULE: {
        dsl += this.catchAllScheduleToDsl();
        break;
      }
      case WorkflowNodeType.SEND_TO_ROUTING_POLICY: {
        dsl += this.routingPolicyToDsl();
        break;
      }
      case WorkflowNodeType.NO_KEYS_PRESSED_ON_IVR: {
        dsl += this.noKeysPressedOnIvrToDsl();
        break;
      }
      case WorkflowNodeType.IVR: {
        dsl += this.ivrToDsl();
        break;
      }
      case WorkflowNodeType.PLAY_MESSAGE: {
        dsl += this.playMessageToDsl();
        break;
      }
      case WorkflowNodeType.KEY_PRESS: {
        dsl += this.keyPressToDsl();
        break;
      }
      case WorkflowNodeType.HANG_UP: {
        dsl += this.hangUpToDsl();
        break;
      }
    }
    return dsl;
  }

  internetToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-globe ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  chatMessageToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-comments ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  textMessageToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-sms ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  phoneCallToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-phone ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  startToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-start ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  delayToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-hourglass ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  realScheduleToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-calendar ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  catchAllScheduleToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-calendar ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  playMessageToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-volume-up ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  endToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-stop ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  scheduledActionsToDsl(): string {
    let dsl = "";
    dsl += `${this.id}{fa:fa-code-fork ${this.title}}\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  replaceAll(str: string): string {
    let hasNewLine: boolean = false;
    hasNewLine = str.includes("\n");
    while (hasNewLine) {
      str = str.replace("\n", "</br>");
      hasNewLine = str.includes("\n");
    }
    return str;
  }

  sendSmsToDsl(): string {
    const displayText = this.replaceAll(this.title);
    let dsl = "";
    dsl += `${this.id}(fa:fa-mobile ${displayText})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  sendEmailToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-envelope ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  routingPolicyToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-list-alt ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  ivrToDsl(): string {
    let dsl = "";
    dsl += `${this.id}{fa:fa-phone-square ${this.title}}\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  keyPressToDsl(): string {
    let dsl = "";
    dsl += `${this.id}((fa:fa-share-square ${this.title}))\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  noKeysPressedOnIvrToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-redo ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }

  hangUpToDsl(): string {
    let dsl = "";
    dsl += `${this.id}(fa:fa-phone-slash ${this.title})\n`;
    this.parentNodeIds.forEach(id => {
      dsl += `${id}==>${this.id}\n`;
    });
    dsl += `click ${this.id} nc${this.mermaidDivId}\n`;
    return dsl;
  }
}
