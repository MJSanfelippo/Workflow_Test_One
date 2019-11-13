import {bindable} from 'aurelia-framework';

export class WorkflowContainer {
  @bindable public message: string = '';
  @bindable workflowId: string;
  @bindable allSchedules: any[];
  @bindable allMessages: any[];
  @bindable allRoutingPolicies: any[];

  attached(){
    console.log(this.workflowId);
  }
}
