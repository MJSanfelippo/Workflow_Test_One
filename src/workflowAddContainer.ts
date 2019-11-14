
import { autoinject, observable, LogManager, bindable } from "aurelia-framework";
import { WorkflowManager, WorkflowType } from "./managers/workflowManager";
import { PLATFORM } from "aurelia-pal";
import { Router } from "aurelia-router";
import { WorkflowNodeType } from "./workflowComponents/enums/workflowNodeType";
import { WorkflowNode } from "./workflowComponents/models/workflowNode";
import { Workflow } from "./workflowComponents/models/workflow";
import { Logger } from "aurelia-logging";
import { Utility } from "./utility";
import * as $ from "jquery";
import { WorkflowManager as SingletonWorkflowManager} from "./WorkflowManager";
import { EventAggregator } from "aurelia-event-aggregator";

const mermaid = PLATFORM.global.mermaid;



@autoinject()
export class WorkflowAddContainer {

  @observable private selectedLeadType: string;

  private workflowManager: WorkflowManager;
  private mermaidDiv: HTMLDivElement;
  private mermaidId: string;
  private _logger: Logger;
  private allLeadTypes: string[];
  @bindable allScheduleOptions: any[] = [];
  @bindable allRoutingPolicyOptions: any[] = [];
  @bindable allMessages: any[] = [];
  @bindable id: string;
  private nodeId: string;
  private selectedNode: WorkflowNode;


  constructor(
    private router: Router,
    private utility: Utility,
    private singletonWorkflowManager: SingletonWorkflowManager,
    private ea: EventAggregator
  ) {
    this._logger = LogManager.getLogger("workflow-add");
    this.mermaidId = utility.generateUUID().replace(/-/g, "");
    this.initializeMermaid();
    PLATFORM.global[`nc${this.mermaidId}`] = this.nodeClicked;
    this.setAllLeadTypes();
    
  }

  detached(): void {
    PLATFORM.global[`nc${this.mermaidId}`] = undefined;
    this.singletonWorkflowManager.removeFromList(this.id);
  }

  private setAllLeadTypes(): void {
    this.allLeadTypes = ["Call", "Internet", "Chat", "SMS"];
    this.selectedLeadType = this.allLeadTypes[0];
  }

  
  public testUpdateClick(): void {
  }

  private addLeadNode(): void {
    this.workflowManager.workflow.workflowNodes = [];
    const startNodeId = this.utility.generateUUID();
    const leadNodeId = this.utility.generateUUID();

    const startNode = new WorkflowNode(startNodeId, "Start", [], WorkflowNodeType.START, this.mermaidId);
    const leadNode = new WorkflowNode(leadNodeId, this.selectedLeadType, [startNodeId], this.getLeadNodeType(), this.mermaidId);
    this.workflowManager.workflow.type = this.getWorkflowType();
    this.workflowManager.selectedNodeId = leadNodeId;
    this.workflowManager.addWorkflowNode(startNode);
    this.workflowManager.addWorkflowNode(leadNode);
    this.nodeClicked(leadNode.id);
    this.workflowManager.render();
  }

  getLeadNodeType(): WorkflowNodeType {
    let type: WorkflowNodeType;

    if (this.selectedLeadType === "Call") {
      type = WorkflowNodeType.PHONE_CALL;
    } else if (this.selectedLeadType === "Chat") {
      type = WorkflowNodeType.CHAT_MESSAGE;
    } else if (this.selectedLeadType === "SMS") {
      type = WorkflowNodeType.TEXT_MESSAGE;
    } else {
      type = WorkflowNodeType.INTERNET;
    }
    return type;
  }

  private getWorkflowType(): WorkflowType {
    if (this.selectedLeadType === "Internet") {
      return WorkflowType.INTERNET;
    } else if (this.selectedLeadType === "Call") {
      return WorkflowType.CALL;
    } else if (this.selectedLeadType === "Chat") {
      return WorkflowType.CHAT;
    } else {
      return WorkflowType.SMS;
    }
  }

  // NOTE: Use an arrow function to preseve the meaning of "this". This way, you do not need to reference this view-model by adding a global "me" property to the window
  private nodeClicked = (nodeId: string): void => {
    const node: WorkflowNode = this.workflowManager.getNodeById(nodeId);
    this.ea.publish('my-test-ea', nodeId);
    this.selectedNode = node;
    this.workflowManager.selectedNode = node;
    this.workflowManager.selectedNodeId = nodeId;
    this.nodeId = nodeId;
    this.render();
  }

  async attached(): Promise<void> {
    try {
      this.mermaidDiv = document.getElementById(this.mermaidId) as HTMLDivElement;
      this.workflowManager = new WorkflowManager(this.mermaidDiv);
      this.singletonWorkflowManager.addToList(this.id, this.workflowManager);
    } catch (error) {
      this._logger.error(error);
    }
  }

  public render(): void {
    try {
      const dsl = this.workflowManager.workflowToMermaidDSL();
      if (mermaid.mermaidAPI.parse(dsl) === undefined) {
        $(this.mermaidDiv).unbind();
        this.mermaidDiv.innerHTML = "";
        mermaid.render(`svg${this.mermaidId}`, dsl, (svg, bindEvents) => {
          this.mermaidDiv.innerHTML = svg;
          bindEvents(this.mermaidDiv);
        });
      }
    } catch (error) {
      this._logger.error(error);
    }
  }

  private initializeMermaid(): void {
    mermaid.initialize({
      startOnLoad: false
    });
  }

  save(): Promise<void> {
    // just testing parsing it to/from json
    const id = this.utility.generateUUID();
    this.workflowManager.workflow.id = id;
    const json = this.workflowManager.workflowToJSON();
    const parsedJson = JSON.parse(json);
    const workflow = new Workflow(parsedJson.workflowNodes as WorkflowNode[], parsedJson.type, parsedJson.id, parsedJson.name);
    return Promise.resolve();
  }
}
