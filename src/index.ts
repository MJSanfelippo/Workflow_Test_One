import { FrameworkConfiguration } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import { WorkflowManager } from './WorkflowManager';


export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    PLATFORM.moduleName('./elements/workflow-container'),
    './WorkflowManager'
  ]);

  config.singleton(WorkflowManager, WorkflowManager);
  config.container.get(WorkflowManager);
}

export { WorkflowManager };
