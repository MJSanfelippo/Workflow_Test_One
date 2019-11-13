import {bindable, autoinject} from 'aurelia-framework';
import { WorkflowManager } from './../WorkflowManager';

@autoinject()
export class WorkflowContainer {
  @bindable public message: string = '';
  @bindable workflowId: string;
  @bindable allSchedules: any[];
  @bindable allMessages: any[];
  @bindable allRoutingPolicies: any[];

  constructor(private singletonWorkflowManager: WorkflowManager){
    
  }
  attached(){
    console.log(this.singletonWorkflowManager);
  }
}
