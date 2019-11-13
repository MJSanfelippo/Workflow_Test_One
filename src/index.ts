import {FrameworkConfiguration} from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';
import { WorkflowManager } from 'WorkflowManager';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    PLATFORM.moduleName('./elements/hello-world')
  ]);
}

export default WorkflowManager;
