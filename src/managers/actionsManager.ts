
import { WorkflowManager } from "./workflowManager";
import { Action } from "../workflowComponents/models/action";
import { ActionsAllowed } from "../workflowComponents/models/actionsAllowed";
import { Utility } from "./../utility";
export class ActionsManager {

  actionsAllowed: ActionsAllowed;
  workflowManager: WorkflowManager;
  nodeIdsToRemove: string[];
  allActions: Action[];
  nodeId: string;
  utility: Utility;

  constructor(workflowManager: WorkflowManager, actionsAllowed: ActionsAllowed, nodeId: string) {
    this.actionsAllowed = actionsAllowed;
    this.workflowManager = workflowManager;
    this.nodeId = nodeId;
    this.allActions = [];
    this.nodeIdsToRemove = [];
    this.utility = new Utility();
  }
  private setNewActions(): void {
    const tempActions: Action[] = [];
    for (const action of this.allActions) {
      if (!action.toBeRemoved) {
        tempActions.push(action);
      }
    }
    this.allActions = tempActions;
  }

  updateWorkflow(): void {
    this.workflowManager.updateWorkflowActions(this.allActions, this.nodeId, this.nodeIdsToRemove);
    this.nodeIdsToRemove = [];
    this.setNewActions();
  }

  private removeAction(actionToRemove: Action, index: number): void {
    if (this.workflowManager.getNodeById(actionToRemove.id)) {
      actionToRemove.toBeRemoved = true;
      this.nodeIdsToRemove.push(actionToRemove.id);
    } else {
      this.allActions.splice(index, 1);
    }
  }

  private updateArray(action: Action, index: number): void {
    this.allActions = this.allActions.slice();
  }

  private addNewAction(): void {
    this.allActions.push(new Action(this.utility.generateUUID(), null, this.actionsAllowed));
  }
}
