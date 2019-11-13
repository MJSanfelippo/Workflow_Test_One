

export class ScheduleData {
  schedule: any;
  toBeRemoved: boolean;
  allScheduleOptions: any[];
  id: string;

  constructor(schedule: any = null, toBeRemoved: boolean = false, allScheduleOptions: any[], id: string) {
    this.schedule = schedule;
    this.toBeRemoved = toBeRemoved;
    this.id = id;
    this.allScheduleOptions = allScheduleOptions ? allScheduleOptions : [];
    this.schedule = !this.schedule ? this.allScheduleOptions[0] : this.allScheduleOptions.find(x => x.id === this.schedule.id);
  }
}
