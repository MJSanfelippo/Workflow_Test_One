import { ScheduleData } from "./scheduleData";

export class ScheduledActionsData {
  schedules: ScheduleData[];

  constructor(schedules: ScheduleData[] = []) {
    this.schedules = schedules;
  }
}
