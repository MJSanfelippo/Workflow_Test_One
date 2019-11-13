
import { WorkflowManager } from "../../managers/workflowManager";
import { bindable, autoinject, observable, child } from "aurelia-framework";
import { WorkflowNode } from "../models/workflowNode";
import { WorkflowNodeType } from "../enums/workflowNodeType";
import { ScheduleData } from "../models/scheduleData";
import { ScheduledActionsData } from "../models/scheduledActionsData";
import { ScheduleNodeData } from "../models/scheduleNodeData";
import { Utility } from "./../../utility";


@autoinject()
export class ScheduledActionsNodeView {

  @bindable private workflowManager: WorkflowManager;
  @bindable private allScheduleOptions: any[];
  @bindable @observable private selectedLeadType: string;
  @bindable @observable private nodeId: string;

  private duplicatesError: boolean;
  private node: WorkflowNode;

  private scheduledActionsData: ScheduledActionsData;
  private scheduleNodeIdsToDelete: string[];

  constructor(
    private utility: Utility
  ) {
    this.duplicatesError = false;
    this.scheduledActionsData = new ScheduledActionsData();
    this.scheduleNodeIdsToDelete = [];
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.SCHEDULED_ACTIONS) {
      this.node = this.workflowManager.getNodeById(newValue);
      const children = this.workflowManager.getNodesByParentId(newValue);
      for (let i = 0; i < children.length; i++) {
        if (children[i].type === WorkflowNodeType.CATCH_ALL_SCHEDULE) {
          children.splice(i, 1);
        }
      }
      this.scheduledActionsData.schedules = [];
      children.forEach(child => {
        let scheduleNodeData: ScheduleNodeData;
        if (child.extraData.trim() !== "") {
          scheduleNodeData = JSON.parse(child.extraData) as ScheduleNodeData;
        }
        this.scheduledActionsData.schedules.push(new ScheduleData(scheduleNodeData.schedule, false, this.allScheduleOptions, child.id));
      });
      this.scheduledActionsData.schedules = this.scheduledActionsData.schedules.slice();
      this.scheduleNodeIdsToDelete = [];
    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    this.duplicatesError = false;
  }

  updateSchedules(schedule: ScheduleData, index: number): void {
    this.scheduledActionsData.schedules = this.scheduledActionsData.schedules.slice();
  }

  private removeSchedule(scheduleToRemove: ScheduleData, index: number): void {
    if (this.workflowManager.getNodeById(scheduleToRemove.id)) {
      scheduleToRemove.toBeRemoved = true;
      this.scheduleNodeIdsToDelete.push(scheduleToRemove.id);
    } else {
      this.scheduledActionsData.schedules.splice(index, 1);
    }
  }

  private addNewSchedule(): void {
    this.scheduledActionsData.schedules.push(new ScheduleData(null, false,
      this.allScheduleOptions, this.utility.generateUUID()));
  }

  private setDuplicatesError(): void {
    this.duplicatesError = true;
    setTimeout(() => {
      this.duplicatesError = false;
    }, 4500);
  }

  private isValidSchedules(): boolean {
    const set: Set<string> = new Set<string>();
    let realLength: number = this.scheduledActionsData.schedules.length;
    this.scheduledActionsData.schedules.forEach(scheduledActionData => {
      if (!scheduledActionData.toBeRemoved) {
        set.add(scheduledActionData.schedule.id);
      } else {
        realLength--;
      }
    });
    return set.size !== realLength;
  }

  private setNewSchedules(): void {
    const tempSchedules: ScheduleData[] = [];
    this.scheduledActionsData.schedules.forEach(schedule => {
      if (!schedule.toBeRemoved) {
        tempSchedules.push(schedule);
      }
    });
    this.scheduledActionsData.schedules = tempSchedules;
  }

  private updateWorkflow(): void {
    this.duplicatesError = false;
    const sameScheduleError = this.isValidSchedules();
    if (sameScheduleError) {
      this.setDuplicatesError();
      return;
    }
    this.workflowManager.updateScheduledActions(this.nodeId, this.scheduledActionsData, this.scheduleNodeIdsToDelete);
    this.setNewSchedules();
  }
}
