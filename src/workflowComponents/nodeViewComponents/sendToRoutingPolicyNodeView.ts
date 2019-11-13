import { bindable, autoinject, observable } from "aurelia-framework";
import { WorkflowManager, WorkflowType } from "../../managers/workflowManager";
import { WorkflowNode } from "../models/workflowNode";
import { ActionsManager } from "../../managers/actionsManager";
import { RoutingPolicyData } from "../models/routingPolicy";
import { ActionsAllowed } from "../models/actionsAllowed";
import { WorkflowNodeType } from "../enums/workflowNodeType";

@autoinject()
export class SendToRoutingPolicyNodeView {
  @bindable private workflowManager: WorkflowManager;
  @bindable private scheduleId: string;
  @bindable private selectedLeadType: string;

  @bindable @observable private nodeId: string;

  private node: WorkflowNode;

  @bindable private allRoutingPolicies: any[];

  private chosenRoutingPolicy: any;

  private actionsManager: ActionsManager;

  constructor(
  
  ) {
  }

  nodeIdChanged(newValue: string, oldValue: string): void {
    if (this.workflowManager.selectedNode.type === WorkflowNodeType.SEND_TO_ROUTING_POLICY) {
      this.node = this.workflowManager.getNodeById(newValue);

      if (this.node.extraData) {
        const id = ((JSON.parse(this.node.extraData)) as RoutingPolicyData).id;
        this.allRoutingPolicies.forEach(rp => {
          if (rp.workflowId === id) {
            this.chosenRoutingPolicy = rp;
          }
        });
      } else {
        this.chosenRoutingPolicy = this.allRoutingPolicies[0];
      }
      if (!this.actionsManager) {
        const isCall = this.workflowManager.workflow.type === WorkflowType.CALL;
        this.actionsManager = new ActionsManager(this.workflowManager, new ActionsAllowed(isCall, isCall, isCall), newValue);
      } else {
        this.actionsManager.nodeId = newValue;
        this.actionsManager.allActions = this.workflowManager.getNewActionsFromChildren(newValue);
      }
    }
  }

  selectedLeadTypeChanged(newValue: string, oldValue: string): void {
    if (this.allRoutingPolicies) {
      this.chosenRoutingPolicy = this.allRoutingPolicies[0];
    }
  }

  private addRoutingPolicyToWorkflow(): void {
    this.node.extraData = JSON.stringify(new RoutingPolicyData(this.chosenRoutingPolicy.workflowId));
    this.actionsManager.updateWorkflow();
  }

}
