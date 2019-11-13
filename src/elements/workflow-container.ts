import {bindable} from 'aurelia-framework';

export class WorkflowContainer {
  @bindable public message: string = '';
  @bindable workflowId: string;

  attached(){
    console.log(this.workflowId);
  }
}
