
import { autoinject, PLATFORM } from "aurelia-framework";
import { WorkflowNode } from "../workflowComponents/models/workflowNode";
import { Workflow } from "../workflowComponents/models/workflow";
import { WorkflowNodeType } from "../workflowComponents/enums/workflowNodeType";
import { KeyPressAction } from "../workflowComponents/models/keyPressAction";
import { ScheduleNodeData } from "../workflowComponents/models/scheduleNodeData";
import { Action } from "../workflowComponents/models/action";
import { ActionIcon } from "../workflowComponents/models/actionIcon";
import { ScheduledActionsData } from "../workflowComponents/models/scheduledActionsData";
import { ActionsAllowed } from "../workflowComponents/models/actionsAllowed";
import { Utility } from "./../utility";

const mermaid = PLATFORM.global.mermaid;

@autoinject
export class WorkflowManager {

  workflow: Workflow;
  nodesToDelete: WorkflowNode[] = [];
  selectedNodeId: string;
  selectedNode: WorkflowNode;
  mermaidDiv: HTMLDivElement;
  private utility: Utility;

  constructor(mermaidDiv: HTMLDivElement) {
    this.workflow = new Workflow([], WorkflowType.INTERNET);
    this.mermaidDiv = mermaidDiv;
    this.utility = new Utility();
  }

  resetSelectedNode(): void {
    this.selectedNode = undefined;
  }

  getChildrenByType(parentId: string, nodeType: WorkflowNodeType): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];
    const children = this.getNodesByParentId(parentId);
    children.forEach(child => {
      if (child.type === nodeType) {
        nodes.push(child);
      }
    });
    return nodes;
  }

  childrenHaveNodeTypeByParentId(parentId: string, nodeType: WorkflowNodeType): boolean {
    const children = this.getNodesByParentId(parentId);
    return children.some(x => x.type === nodeType);
  }

  deleteOldActions(nodeIdsToDelete: string[]): void {
    nodeIdsToDelete.forEach(id => {
      this.deleteChildren(id);
    });
  }

  getScheduleIdsOfScheduledActionsNode(scheduledActionsNodeId: string): string[] {
    const children = this.getNodesByParentId(scheduledActionsNodeId);
    const scheduleIds: string[] = [];
    children.forEach(child => {
      const scheduleNodeData = JSON.parse(child.extraData) as ScheduleNodeData;
      const scheduleId = scheduleNodeData.schedule.id;
      scheduleIds.push(scheduleId);
    });
    return scheduleIds;
  }

  getTypeFromActionName(actionName: string): WorkflowNodeType {
    let type: WorkflowNodeType;
    if (actionName === "Scheduled Actions") {
      type = WorkflowNodeType.SCHEDULED_ACTIONS;
    } else if (actionName === "Send SMS") {
      type = WorkflowNodeType.SEND_SMS;
    } else if (actionName === "Delay") {
      type = WorkflowNodeType.DELAY;
    } else if (actionName === "Send Email") {
      type = WorkflowNodeType.SEND_EMAIL;
    } else if (actionName === "Play Message") {
      type = WorkflowNodeType.PLAY_MESSAGE;
    } else if (actionName === "IVR") {
      type = WorkflowNodeType.IVR;
    } else if (actionName === "Routing Policy") {
      type = WorkflowNodeType.SEND_TO_ROUTING_POLICY;
    } else if (actionName === "Hang Up") {
      type = WorkflowNodeType.HANG_UP;
    } else if (actionName === "No Keys Pressed") {
      type = WorkflowNodeType.NO_KEYS_PRESSED_ON_IVR;
    } else {
      return null; // who knows
    }
    return type;
  }

  deleteChildren(nodeId: string): void {
    this.setChildrenToDelete(nodeId);
    this.nodesToDelete.push(this.getNodeById(nodeId));
    this.removeDeletedChildren();
  }

  getNewActionsFromChildren(nodeId: string): Action[] {
    const childrenNodes = this.getNodesByParentId(nodeId);
    const newActions: Action[] = [];
    childrenNodes.forEach(childNode => {
      const type = childNode.type;
      let actionToAdd: Action;
      if (type === WorkflowNodeType.SCHEDULED_ACTIONS) {
        actionToAdd = new Action(childNode.id, new ActionIcon("Scheduled Actions", "&#xf126;"), new ActionsAllowed(true, true, true));
      } else if (type === WorkflowNodeType.SEND_SMS) {
        actionToAdd = new Action(childNode.id, new ActionIcon("Send SMS", "&#xf10b;"), new ActionsAllowed(true, true, true));
      } else if (type === WorkflowNodeType.SEND_EMAIL) {
        actionToAdd = new Action(childNode.id, new ActionIcon("Send Email", "&#xf0e0;"), new ActionsAllowed(true, true, true));
      } else if (type === WorkflowNodeType.DELAY) {
        actionToAdd = new Action(childNode.id, new ActionIcon("Delay", "&#xf254;"), new ActionsAllowed(true, true, true));
      } else if (type === WorkflowNodeType.PLAY_MESSAGE) {
        actionToAdd = new Action(childNode.id, new ActionIcon("Play Message", "&#xf028;"), new ActionsAllowed(true, true, true));
      } else if (type === WorkflowNodeType.IVR) {
        actionToAdd = new Action(childNode.id, new ActionIcon("IVR", "&#xf098;"), new ActionsAllowed(true, true, true));
      } else if (type === WorkflowNodeType.SEND_TO_ROUTING_POLICY) {
        actionToAdd = new Action(childNode.id, new ActionIcon("Routing Policy", "&#xf022;"), new ActionsAllowed(true, true, true));
      } else if (type === WorkflowNodeType.HANG_UP) {
        actionToAdd = new Action(childNode.id, new ActionIcon("Hang Up", "&#xf3dd;"), new ActionsAllowed(true, true, true));
      }
      newActions.push(actionToAdd);
    });
    return newActions;
  }

  getNewKeyPressesFromChildren(ivrNodeId: string): KeyPressAction[] {
    const newKeyPressActions: KeyPressAction[] = [];

    const keyPressChildren = this.getNodesByParentId(ivrNodeId);
    for (let i = 0; i < keyPressChildren.length; i++) {
      const child = keyPressChildren[i];
      if (child.type === WorkflowNodeType.NO_KEYS_PRESSED_ON_IVR) {
        keyPressChildren.splice(i, 1);
        i--;
      }
    }
    keyPressChildren.forEach(keyPressChild => {
      const newKeyPressAction = new KeyPressAction(keyPressChild.title, keyPressChild.id);
      newKeyPressActions.push(newKeyPressAction);
    });
    return newKeyPressActions;
  }

  updateScheduledActions(nodeId: string, scheduledActions: ScheduledActionsData, scheduleNodeIdsToDelete: string[]): void {

    this.deleteOldActions(scheduleNodeIdsToDelete);

    const children = this.getNodesByParentId(nodeId);

    scheduledActions.schedules.forEach(schedule => {
      if (!schedule.toBeRemoved) {
        const node = this.getNodeById(schedule.id);
        if (node) {
          node.extraData = JSON.stringify(new ScheduleNodeData(schedule.schedule));
        } else {
          const node = new WorkflowNode(schedule.id, schedule.schedule.name, [nodeId], WorkflowNodeType.REAL_SCHEDULE, this.mermaidDiv.id);
          node.extraData = JSON.stringify(new ScheduleNodeData(schedule.schedule));
          this.addWorkflowNode(node);
        }
      }
    });

    let hasCatchAll: boolean = false;

    for (const child of children) {
      if (child.type === WorkflowNodeType.CATCH_ALL_SCHEDULE) {
        hasCatchAll = true;
      }
    }

    if (!hasCatchAll) {
      const catchAllNode = new WorkflowNode(this.utility.generateUUID(), "Catch All", [nodeId], WorkflowNodeType.CATCH_ALL_SCHEDULE, this.mermaidDiv.id);
      this.addWorkflowNode(catchAllNode);
    }

    this.workflow.validateWorkflowUpdate();
    this.render();

  }

  updateIvrKeyPresses(ivrNodeId: string, keyPresses: KeyPressAction[], noKeysPressedNodeIdsToDelete: string[], keyPressedNodeIdsToDelete: string[], numberOfRepeats: number, chosenNoKeysPressedActions: Action[]): void {

    this.deleteOldActions(keyPressedNodeIdsToDelete);

    for (const keyPress of keyPresses) {
      if (!keyPress.toBeRemoved) {
        const node = this.getNodeById(keyPress.id);
        if (node) {
          if (node.title !== keyPress.keyPress) {
            node.extraData = "";
            node.title = keyPress.keyPress;
          }
        } else {
          const node = new WorkflowNode(keyPress.id, keyPress.keyPress, [ivrNodeId], WorkflowNodeType.KEY_PRESS, this.mermaidDiv.id);
          this.addWorkflowNode(node);
        }
      }
    }

    let noKeysPressedNode = this.getNoKeysPressedChildFromIvrNode(ivrNodeId);
    if (!noKeysPressedNode) {
      noKeysPressedNode = new WorkflowNode(this.utility.generateUUID(), "No Keys Pressed", [ivrNodeId], WorkflowNodeType.NO_KEYS_PRESSED_ON_IVR, this.mermaidDiv.id);
      this.addWorkflowNode(noKeysPressedNode);
    }
    this.updateWorkflowActions(chosenNoKeysPressedActions, noKeysPressedNode.id, noKeysPressedNodeIdsToDelete);
    // this.render();
  }

  addNodeByType(nodeName: string, parentNodeId: string, nodeId: string): void {
    if (nodeName === "Scheduled Actions") {
      this.addWorkflowNode(new WorkflowNode(nodeId, "Scheduled Actions", [parentNodeId], WorkflowNodeType.SCHEDULED_ACTIONS, this.mermaidDiv.id));
    } else if (nodeName === "Send SMS") {
      this.addWorkflowNode(new WorkflowNode(nodeId, "Send SMS", [parentNodeId], WorkflowNodeType.SEND_SMS, this.mermaidDiv.id));
    } else if (nodeName === "Delay") {
      this.addWorkflowNode(new WorkflowNode(nodeId, "Delay", [parentNodeId], WorkflowNodeType.DELAY, this.mermaidDiv.id));
    } else if (nodeName === "Send Email") {
      this.addWorkflowNode(new WorkflowNode(nodeId, "Send Email", [parentNodeId], WorkflowNodeType.SEND_EMAIL, this.mermaidDiv.id));
    } else if (nodeName === "Play Message") {
      this.addWorkflowNode(new WorkflowNode(nodeId, "Play Message", [parentNodeId], WorkflowNodeType.PLAY_MESSAGE, this.mermaidDiv.id));
    } else if (nodeName === "IVR") {
      this.addWorkflowNode(new WorkflowNode(nodeId, "IVR", [parentNodeId], WorkflowNodeType.IVR, this.mermaidDiv.id));
    } else if (nodeName === "Routing Policy") {
      this.addWorkflowNode(new WorkflowNode(nodeId, "Routing Policy", [parentNodeId], WorkflowNodeType.SEND_TO_ROUTING_POLICY, this.mermaidDiv.id));
    } else if (nodeName === "Hang Up") {
      this.addWorkflowNode(new WorkflowNode(nodeId, "Hang Up", [parentNodeId], WorkflowNodeType.HANG_UP, this.mermaidDiv.id));
    }
  }

  getNoKeysPressedChildFromIvrNode(ivrNodeId: string): WorkflowNode {
    let noKeysPressedNode: WorkflowNode;

    const children = this.getNodesByParentId(ivrNodeId);
    children.forEach(child => {
      if (child.type === WorkflowNodeType.NO_KEYS_PRESSED_ON_IVR) {
        noKeysPressedNode = child;
      }
    });
    return noKeysPressedNode;
  }

  updateWorkflowActions(actions: Action[], parentNodeId: string, nodeIdsToDelete: string[]): void {
    this.deleteOldActions(nodeIdsToDelete);
    const actionsList = ["Send SMS", "Delay", "Send Email", "Play Message", "Routing Policy", "Hang Up"];
    const decisionsList = ["Scheduled Actions", "IVR"];
    for (const action of actions) {
      if (!action.toBeRemoved) {
        const node = this.workflow.getNodeById(action.id);
        if (node) {
          if (node.title !== action.chosenActionIcon.actionName) {
            if (actionsList.includes(node.title) && !actionsList.includes(action.chosenActionIcon.actionName)) {
              this.deleteChildren(node.id);

              this.addNodeByType(action.chosenActionIcon.actionName, parentNodeId, action.id);
            } else if ((node.title === "Scheduled Actions" && action.chosenActionIcon.actionName === "IVR") || (node.title === "IVR" && action.chosenActionIcon.actionName === "Scheduled Actions")) {
              this.deleteChildren(node.id);
              this.addNodeByType(action.chosenActionIcon.actionName, parentNodeId, action.id);
            } else if (decisionsList.includes(node.title) && !decisionsList.includes(action.chosenActionIcon.actionName)) {
              this.deleteChildren(node.id);
              this.addNodeByType(action.chosenActionIcon.actionName, parentNodeId, action.id);
            }
            node.extraData = "";
            node.type = this.getTypeFromActionName(action.chosenActionIcon.actionName);
            node.title = action.chosenActionIcon.actionName;
          }
        } else {
          this.addNodeByType(action.chosenActionIcon.actionName, parentNodeId, action.id);
        }
      }
    }
    this.workflow.validateWorkflowUpdate();
    this.render();
  }

  render(): void {
    this.mermaidDiv.innerHTML = "";
    const dsl = this.workflowToMermaidDSL();
    mermaid.render(`svg${this.mermaidDiv.id}`, dsl, (svg, bindEvents) => {
      this.mermaidDiv.innerHTML = svg;
      bindEvents(this.mermaidDiv);
    });
  }

  workflowToMermaidDSL(): string {
    let dsl = this.workflow.toMermaidDSL();
    if (this.selectedNodeId) {
      dsl += `style ${this.selectedNodeId} stroke:#add8e6,stroke-width:4px \n`;
    }
    return dsl;
  }

  workflowToJSON(): string {
    return JSON.stringify(this.workflow);
  }

  addWorkflowNode(node: WorkflowNode): void {
    this.workflow.addWorkflowNode(node);
  }

  getNodeById(id: string): WorkflowNode {
    return this.workflow.getNodeById(id);
  }

  containsNodeById(id: string): boolean {
    let contains: boolean = false;
    this.workflow.workflowNodes.forEach(workflowNode => {
      if (workflowNode.id === id) {
        contains = true;
      }
    });
    return contains;
  }

  getNodesByType(type: WorkflowNodeType): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];
    this.workflow.workflowNodes.forEach(workflowNode => {
      if (workflowNode.type === type) {
        nodes.push(workflowNode);
      }
    });
    return nodes;
  }

  containsNodeByType(type: WorkflowNodeType): boolean {
    let contains: boolean = false;
    this.workflow.workflowNodes.forEach(workflowNode => {
      if (workflowNode.type === type) {
        contains = true;
      }
    });
    return contains;
  }

  getIndexOfNodeById(id: string): number {
    let index: number = -1;
    for (let i = 0; i < this.workflow.workflowNodes.length; i++) {
      if (this.workflow.workflowNodes[i].id === id) {
        index = i;
      }
    }
    return index;
  }

  getIndexOfNodeByType(type: WorkflowNodeType): number {
    let index: number = -1;
    for (let i = 0; i < this.workflow.workflowNodes.length; i++) {
      if (this.workflow.workflowNodes[i].type === type) {
        index = i;
      }
    }
    return index;
  }

  containsNodeByParentId(id: string): boolean {
    let hasNode: boolean = false;
    this.workflow.workflowNodes.forEach(node => {
      if (node.parentNodeIds.includes(id)) {
        hasNode = true;
      }
    });
    return hasNode;
  }

  getNodesByParentId(parentId: string): WorkflowNode[] {
    const nodesToReturn: WorkflowNode[] = [];
    this.workflow.workflowNodes.forEach(node => {
      if (node.parentNodeIds.includes(parentId)) {
        nodesToReturn.push(node);
      }
    });
    return nodesToReturn;
  }

  getIndexOfNodeByParentId(parentId: string): number {
    let index = -1;
    for (let i = 0; i < this.workflow.workflowNodes.length; i++) {
      if (this.workflow.workflowNodes[i].parentNodeIds.includes(parentId)) {
        index = i;
      }
    }
    return index;
  }

  setChildrenToDelete(parentId: string): void {
    let hasChild: boolean = false;
    hasChild = this.containsNodeByParentId(parentId);
    if (hasChild) {
      const childNodes = this.getNodesByParentId(parentId);
      for (const child of childNodes) {
        this.setChildrenToDelete(child.id);
        this.nodesToDelete.push(child);
      }
    } else {
      
    }
  }

  getAllScheduleIds(): string[] {
    const scheduleIds: string[] = [];
    this.workflow.workflowNodes.forEach(workflowNode => {
      if (workflowNode.type === WorkflowNodeType.REAL_SCHEDULE) {
        scheduleIds.push(workflowNode.id);
      }
    });
    return scheduleIds;
  }

  removeDeletedChildren(): void {
    const nodesThatStay: WorkflowNode[] = [];
    const nodeIndicesToDelete: number[] = [];
    for (const node of this.nodesToDelete) {
      nodeIndicesToDelete.push(this.getIndexOfNodeById(node.id));
    }
    for (let i = 0; i < this.workflow.workflowNodes.length; i++) {
      if (!nodeIndicesToDelete.includes(i)) {
        nodesThatStay.push(this.workflow.workflowNodes[i]);
      }
    }
    this.workflow.workflowNodes = nodesThatStay;
    this.nodesToDelete = [];
  }
}

export enum WorkflowType {
  INTERNET,
  CALL,
  CHAT,
  SMS
}
