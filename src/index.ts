import { FrameworkConfiguration, Container } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import { WorkflowManager } from './WorkflowManager';


export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    PLATFORM.moduleName('./elements/workflow-container'),
    PLATFORM.moduleName('./workflowAddContainer')
  ]);

  config.singleton(WorkflowManager, WorkflowManager);
}

export let AllWorkflowManager = Container.instance.get(WorkflowManager);

