import {bindable} from 'aurelia-framework';

export class HelloWorld {
  @bindable public message: string = '';
  @bindable workflowId: string;

  attached(){
    console.log(this.workflowId);
  }
}
