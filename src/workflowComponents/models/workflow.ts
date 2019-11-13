import { WorkflowNode } from "./workflowNode";
import { WorkflowType } from "../../managers/workflowManager";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { WorkflowError, WorkflowErrorTypes, ErrorType } from "./error";
import * as _ from "lodash";

export class Workflow {
  workflowNodes: WorkflowNode[];
  type: WorkflowType;
  name: string;
  id: string;
  private errors: WorkflowError[];
  private errorTypes: WorkflowErrorTypes;

  constructor(workflowNodes: WorkflowNode[] = [], type: WorkflowType, id: string = "", name: string = "") {
    this.workflowNodes = workflowNodes;
    this.type = type;
    this.name = name;
    this.id = id;
    this.errors = [];
    this.errorTypes = new WorkflowErrorTypes();
  }

  toMermaidDSL(): string {
    let dsl = "graph TD" + "\n";
    this.workflowNodes.forEach(node => {
      dsl += node.toMermaidDSL();
      if (node.isErrors) {
        dsl += `\n style ${node.id} stroke:#FF0000,stroke-width:3px \n`;
      } else if (node.disabled) {
        dsl += `\n style ${node.id} fill:#ADADC0 \n`;
      }
    });
    return dsl;
  }

  addWorkflowNode(workflowNode: WorkflowNode): void {
    if (this.workflowNodes) {
      this.workflowNodes.push(workflowNode);
    }
  }

  getNodeById(id: string): WorkflowNode {
    let nodeToReturn: WorkflowNode;
    this.workflowNodes.forEach(node => {
      if (node.id === id) {
        nodeToReturn = node;
      }
    });
    return nodeToReturn;
  }

  public validateWorkflowUpdate(): void {

    if (!this.errors) {
      this.errors = [];
    } else {
      this.errors.splice(0, this.errors.length);
    }

    if (!this.workflowNodes) {
      this.addError(ErrorType.Empty_Workflow_Update);
      return;
    }

    for (let i = 0; i < this.workflowNodes.length; i++) {
      this.workflowNodes[i].resetErrors(i);
    }

    const startNode = this.findStartNode();

    if (!startNode) {
      this.addError(ErrorType.Start_Not_Found);
      return;
    }

    const nodeStack: WorkflowNode[] = [];
    nodeStack.push(startNode);

    while (nodeStack.length > 0) {
      const currentNode = nodeStack.pop();

      // TODO: finish validation

      this.handleNodeValidation(currentNode);
      const children = this.findChildNodes(currentNode.id);

      for (let i = children.length - 1; i > -1; i--) {

        if (!children[i].disabled) {
          nodeStack.push(children[i]);
        }
      }
    }
  }

  private addError(error: ErrorType): WorkflowError {

    if (!_.some(this.errors, { type: error })) {
      this.errors.push(this.errorTypes.items[error]);
    }

    return this.errorTypes.items[error];
  }

  private handleIVRValidation(node: WorkflowNode): void {

    let doNotIncrementIVRCounter = false;
    
    let ivr_or_rp = false;
    if (node.ivrNodeCount > 0) {
      doNotIncrementIVRCounter = true;
    }

    if (this.type !== WorkflowType.CALL && this.type !== WorkflowType.INTERNET) {
      const error = this.addError(ErrorType.IVR_Node_On_Non_Call_Type);

      node.addError(error);
    }

    if (node.ivrNodeCount < 1) {
      node.addToIVRNodeIndices(node.index);
    } else {
      node.addToIVRNodeIndicesWithoutIncrement(node.index);
    }

    const ancestorNodes = this.findAncestorNodes(node.parentNodeIds);

    
    for (let i = 0; i < ancestorNodes.length; i++) {

      if (ancestorNodes[i].isDecisionNode && (ancestorNodes[i].ivrNodeCount > 0 || ancestorNodes[i].ivr_or_rp_NodeCount > 0)) {
        doNotIncrementIVRCounter = true;
      }

      if (ancestorNodes[i].isDecisionNode && (ancestorNodes[i].rpNodeCount > 0)) {
        ivr_or_rp = true;
      }

      if (doNotIncrementIVRCounter) {
        ancestorNodes[i].addToIVRNodeIndicesWithoutIncrement(node.index);
      }
      else {
        if (ivr_or_rp) {
          ancestorNodes[i].addToIVR_Or_RP(node.index);

        } else {

          ancestorNodes[i].addToIVRNodeIndices(node.index);
        }
      }

      if (ancestorNodes[i].ivrNodeCount > 1 || (ancestorNodes[i].ivrNodeCount > 0 && ancestorNodes[i].ivr_or_rp_NodeCount > 0)) {
        const error = this.addError(ErrorType.IVR_Concurrency);
        const indiciesInError = ancestorNodes[i].ivrNodeIndices;

        indiciesInError.forEach((index: number) => {
          this.workflowNodes[index].addError(error);
        });
      }

      if (ancestorNodes[i].type === WorkflowNodeType.SEND_TO_ROUTING_POLICY) {
        const error = this.addError(ErrorType.RoutingPolicy_Above_IVR);
        node.addError(error);
        ancestorNodes[i].addError(error);
      }

      if ((ancestorNodes[i].ivr_or_rp_NodeCount > 1) || (ancestorNodes[i].ivr_or_rp_NodeCount > 0 && (ancestorNodes[i].rpNodeCount > 0 || ancestorNodes[i].ivrNodeCount > 0) || ancestorNodes[i].rpNodeCount > 0 && ancestorNodes[i].ivrNodeCount > 0)) {

        const ivrIndiciesInError = ancestorNodes[i].ivrNodeIndices;
        const rpIndiciesInError = ancestorNodes[i].rpNodeIndices;

        const error = this.addError(ErrorType.RoutingPolicy_Concurrency_With_IVR);

        ivrIndiciesInError.forEach((index: number) => {
          this.workflowNodes[index].addError(error);
        });

        rpIndiciesInError.forEach((index: number) => {
          this.workflowNodes[index].addError(error);
        });
      }
    }
  }

  private handleRoutingPolicyValidation(node: WorkflowNode): void {

    let doNotIncrementRPCounter = false;
    
    let ivr_or_rp = false;
    const ancestorNodes = this.findAncestorNodes(node.parentNodeIds);

    
    for (let i = 0; i < ancestorNodes.length; i++) {

      if (ancestorNodes[i].isDecisionNode && (ancestorNodes[i].rpNodeCount > 0 || ancestorNodes[i].ivr_or_rp_NodeCount > 0)) {
        doNotIncrementRPCounter = true;
      }

      if (ancestorNodes[i].isDecisionNode && (ancestorNodes[i].ivrNodeCount > 0)) {
        ivr_or_rp = true;
      }

      if (doNotIncrementRPCounter) {
        ancestorNodes[i].addToRPNodeIndiciesWithoutIncrement(node.index);
      }
      else {
        if (ivr_or_rp) {
          ancestorNodes[i].addToRP_Or_IVR(node.index);

        } else {

          ancestorNodes[i].addToRPNodeIndices(node.index);
        }
      }

      if (ancestorNodes[i].type === WorkflowNodeType.SEND_TO_ROUTING_POLICY) {
        const error = this.addError(ErrorType.RoutingPolicy_Same_Path);
        node.addError(error);

        ancestorNodes[i].addError(error);
      }

      if (ancestorNodes[i].rpNodeCount > 1 || (ancestorNodes[i].rpNodeCount > 0 && ancestorNodes[i].ivr_or_rp_NodeCount > 0)) {
        const error = this.addError(ErrorType.RoutingPolicy_Concurrency);

        node.addError(error);
        const indiciesInError = ancestorNodes[i].rpNodeIndices;

        indiciesInError.forEach((index: number) => {
          this.workflowNodes[index].addError(error);
        });
      }

      if ((ancestorNodes[i].ivr_or_rp_NodeCount > 1) || (ancestorNodes[i].ivr_or_rp_NodeCount > 0 && (ancestorNodes[i].rpNodeCount > 0 || ancestorNodes[i].ivrNodeCount > 0) || ancestorNodes[i].rpNodeCount > 0 && ancestorNodes[i].ivrNodeCount > 0)) {

        const ivrIndiciesInError = ancestorNodes[i].ivrNodeIndices;
        const rpIndiciesInError = ancestorNodes[i].rpNodeIndices;

        const error = this.addError(ErrorType.RoutingPolicy_Concurrency_With_IVR);

        ivrIndiciesInError.forEach((index: number) => {
          this.workflowNodes[index].addError(error);
        });

        rpIndiciesInError.forEach((index: number) => {
          this.workflowNodes[index].addError(error);
        });
      }
    }
  }

  private handleCallValidation(node: WorkflowNode): void {
    if (this.type !== WorkflowType.CALL) {
      const error = this.addError(ErrorType.Workflow_Type_Call_Mismatch);

      node.addError(error);
    }
  }

  private handleChatValidation(node: WorkflowNode): void {
    if (this.type !== WorkflowType.CHAT) {
      const error = this.addError(ErrorType.Workflow_Type_Chat_Mismatch);

      node.addError(error);
    }
  }

  private handleInternetValidation(node: WorkflowNode): void {
    if (this.type !== WorkflowType.INTERNET) {
      const error = this.addError(ErrorType.Workflow_Type_Internet_Mismatch);

      node.addError(error);
    }
  }

  private handleSMSValidation(node: WorkflowNode): void {
    if (this.type !== WorkflowType.SMS) {
      const error = this.addError(ErrorType.Workflow_Type_SMS_Mismatch);

      node.addError(error);
    }
  }

  private keyPressValidation(node: WorkflowNode): void {
    const parentNodes = this.findParentNodes(node.parentNodeIds);

    if (!parentNodes || parentNodes.length < 1) {
      const error = this.addError(ErrorType.Key_Press_Has_No_Parent);

      node.addError(error);
    } else {
      
      for (let i = 0; i < parentNodes.length; i++) {

        if (parentNodes[i].type !== WorkflowNodeType.IVR) {
          const error = this.addError(ErrorType.Key_Press_Must_Have_IVR_Parent);

          parentNodes[i].addError(error);
          node.addError(error);
        }
      }
    }
  }

  private noKeyPressValidation(node: WorkflowNode): void {
    const parentNodes = this.findParentNodes(node.parentNodeIds);

    if (!parentNodes || parentNodes.length < 1) {
      const error = this.addError(ErrorType.No_Key_Press_Has_No_Parent);

      node.addError(error);
    } else {
      
      for (let i = 0; i < parentNodes.length; i++) {

        if (parentNodes[i].type !== WorkflowNodeType.IVR) {
          const error = this.addError(ErrorType.No_Key_Press_Must_Have_IVR_Parent);

          parentNodes[i].addError(error);
          node.addError(error);
        }
      }
    }
  }

  private realScheduledActionsValidation(node: WorkflowNode): void {
    const parentNodes = this.findParentNodes(node.parentNodeIds);

    if (!parentNodes || parentNodes.length < 1) {
      const error = this.addError(ErrorType.Real_Schedule_Has_No_Parent);

      node.addError(error);
    } else {
      
      for (let i = 0; i < parentNodes.length; i++) {

        if (parentNodes[i].type !== WorkflowNodeType.SCHEDULED_ACTIONS) {
          const error = this.addError(ErrorType.Real_Schedule_Must_Have_ScheduledActions_Parent);

          parentNodes[i].addError(error);
          node.addError(error);
        }
      }
    }
  }

  private startNodeValidation(node: WorkflowNode): void {
    const children = this.findChildNodes(node.id);

    if (!children || children.length < 1) {
      const error = this.addError(ErrorType.Start_Node_Must_Have_Children);

      node.addError(error);
    }
    if (children && children.length > 0) {
      
      for (let i = 0; i < children.length; i++) {
        if (children[i].type !== WorkflowNodeType.PHONE_CALL && children[i].type !== WorkflowNodeType.CHAT_MESSAGE && children[i].type !== WorkflowNodeType.INTERNET && children[i].type !== WorkflowNodeType.TEXT_MESSAGE) {

          const error = this.addError(ErrorType.Invalid_Start_Node_Type);

          node.addError(error);
          children[i].addError(error);
        }
      }
    }
  }

  private playMessageValidation(node: WorkflowNode): void {
    if (this.type !== WorkflowType.CALL && this.type !== WorkflowType.INTERNET) {
      const error = this.addError(ErrorType.Workflow_Type_PLay_Message_Mismatch);

      node.addError(error);
    }
  }

  private hangUpValidation(node: WorkflowNode): void {
    if (this.type !== WorkflowType.CALL && this.type !== WorkflowType.INTERNET) {
      const error = this.addError(ErrorType.Workflow_Type_Hang_Up_Mismatch);

      node.addError(error);
    }
  }

  private handleNodeValidation(node: WorkflowNode): void {
    switch (node.type) {

      case WorkflowNodeType.START:
        this.startNodeValidation(node);
        break;

      case WorkflowNodeType.PHONE_CALL:
        this.handleCallValidation(node);
        break;

      case WorkflowNodeType.TEXT_MESSAGE:
        this.handleSMSValidation(node);
        break;

      case WorkflowNodeType.INTERNET:
        this.handleInternetValidation(node);
        break;

      case WorkflowNodeType.CHAT_MESSAGE:
        this.handleChatValidation(node);
        break;

      case WorkflowNodeType.DELAY:
        break;

      case WorkflowNodeType.SEND_EMAIL:
        break;

      case WorkflowNodeType.SEND_SMS:
        break;

      case WorkflowNodeType.SCHEDULED_ACTIONS:
        break;

      case WorkflowNodeType.REAL_SCHEDULE:
        this.realScheduledActionsValidation(node);
        break;

      case WorkflowNodeType.CATCH_ALL_SCHEDULE:
        break;

      case WorkflowNodeType.SEND_TO_ROUTING_POLICY:
        this.handleRoutingPolicyValidation(node);
        break;

      case WorkflowNodeType.NO_KEYS_PRESSED_ON_IVR:
        this.noKeyPressValidation(node);
        break;

      case WorkflowNodeType.IVR:
        this.handleIVRValidation(node);
        break;

      case WorkflowNodeType.PLAY_MESSAGE:
        this.playMessageValidation(node);
        break;

      case WorkflowNodeType.KEY_PRESS:
        this.keyPressValidation(node);
        break;

      case WorkflowNodeType.HANG_UP:
        this.hangUpValidation(node);
        break;

    }
  }

  private findStartNode(): WorkflowNode {

    
    for (let i = 0; i < this.workflowNodes.length; i++) {
      if (!this.workflowNodes[i].parentNodeIds || this.workflowNodes[i].parentNodeIds.length < 1) {
        return this.workflowNodes[i];
      }
    }

    return null;
  }

  private findAncestorNodes(parentNodeIds: string[]): WorkflowNode[] {

    const ancestorNodes: WorkflowNode[] = [];
    if (!parentNodeIds || parentNodeIds.length < 1) {
      return ancestorNodes;
    }

    const nodeStack = this.findParentNodes(parentNodeIds);
    while (nodeStack.length > 0) {
      const currentNode = nodeStack.pop();
      ancestorNodes.push(currentNode);

      if (currentNode.parentNodeIds && currentNode.parentNodeIds.length > 0) {
        const parentNodes: WorkflowNode[] = this.findParentNodes(currentNode.parentNodeIds);

        
        for (let i = 0; i < parentNodes.length; i++) {
          nodeStack.push(parentNodes[i]);
        }
      }
    }

    return ancestorNodes;
  }

  private findParentNodes(nodeIds: string[]): WorkflowNode[] {
    const parentNodes: WorkflowNode[] = [];
    if (!nodeIds || nodeIds.length < 1) {
      return parentNodes;
    }

    
    for (let pn = 0; pn < nodeIds.length; pn++) {
      const parentNodeId = nodeIds[pn];
      
      for (let i = 0; i < this.workflowNodes.length; i++) {
        if (parentNodeId === this.workflowNodes[i].id) {
          parentNodes.push(this.workflowNodes[i]);
        }
      }
    }

    return parentNodes;
  }

  private findChildNodes(parentId: string): WorkflowNode[] {

    const childNodes: WorkflowNode[] = [];
    
    for (let i = 0; i < this.workflowNodes.length; i++) {
      if (this.workflowNodes[i].parentNodeIds && this.workflowNodes[i].parentNodeIds.length > 0) {
        if (_.includes(this.workflowNodes[i].parentNodeIds, parentId)) {
          childNodes.push(this.workflowNodes[i]);
        }
      }
    }

    return childNodes;
  }

  private validateWorkflowOnSave(): void {

    if (!this.errors) {
      this.errors = [];
    } else {
      this.errors.splice(0, this.errors.length);
    }

    if (!this.workflowNodes) {
      this.addError(ErrorType.Empty_Worflow_Save);
    }
    else if (this.workflowNodes.length < 1) {
      this.addError(ErrorType.Empty_Worflow_Save);
    }
  }
}
