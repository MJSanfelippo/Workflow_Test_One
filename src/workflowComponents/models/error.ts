
export enum ErrorType {
    Empty_Workflow_Update = 0,
    Empty_Worflow_Save = 1,
    Start_Not_Found = 2,
    IVR_Concurrency = 3,
    RoutingPolicy_Concurrency_With_IVR = 4,
    RoutingPolicy_Concurrency = 5,
    RoutingPolicy_Same_Path = 6,
    RoutingPolicy_Above_IVR = 7,
    IVR_Node_On_Non_Call_Type = 8,
    IVR_Must_Be_In_RP_Path_For_Call_Workflow = 9,
    Workflow_Type_Call_Mismatch = 10,
    Workflow_Type_Internet_Mismatch = 11,
    Workflow_Type_Chat_Mismatch = 12,
    Workflow_Type_SMS_Mismatch = 13,
    Key_Press_Has_No_Parent = 14,
    Key_Press_Must_Have_IVR_Parent = 15,
    No_Key_Press_Has_No_Parent = 16,
    No_Key_Press_Must_Have_IVR_Parent = 17,
    Real_Schedule_Has_No_Parent = 18,
    Real_Schedule_Must_Have_ScheduledActions_Parent = 19,
    Start_Node_Must_Have_Children = 20,
    Invalid_Start_Node_Type = 21,
    Workflow_Type_PLay_Message_Mismatch = 22,
    Workflow_Type_Hang_Up_Mismatch = 23

}

export class WorkflowError {
    private _type: ErrorType;
    private _message: string;

    public get type(): ErrorType { return this._type; }
    public get message(): string { return this._message; }

    constructor(data: IWorkflowError) {
        this._type = data.type;
        this._message = data.message;
    }
}

export interface IWorkflowError {
    type: ErrorType;
    message: string;
}

export class WorkflowErrorTypes {
    public items: WorkflowError[];

    constructor() {
        this.items = [];

        this.items[ErrorType.Empty_Workflow_Update] = new WorkflowError({
            type: ErrorType.Empty_Workflow_Update,
            message: "Cannot update an empty Workflow."
        });

        this.items[ErrorType.Empty_Worflow_Save] = new WorkflowError({
            type: ErrorType.Empty_Worflow_Save,
            message: "Cannot save an empty Workflow."
        });

        this.items[ErrorType.Start_Not_Found] = new WorkflowError({
            type: ErrorType.Start_Not_Found,
            message: "Could not find start node."
        });

        this.items[ErrorType.IVR_Concurrency] = new WorkflowError({
            type: ErrorType.IVR_Concurrency,
            message: "Cannot have multiple IVR nodes on different parallel paths."
        });

        this.items[ErrorType.RoutingPolicy_Concurrency_With_IVR] = new WorkflowError({
            type: ErrorType.RoutingPolicy_Concurrency_With_IVR,
            message: "Cannot have a Routing Policy node on a parallel path with one or more IVR nodes."
        });

        this.items[ErrorType.RoutingPolicy_Concurrency] = new WorkflowError({
            type: ErrorType.RoutingPolicy_Concurrency,
            message: "Cannot have multiple Routing Policy nodes on different parallel paths."
        });

        this.items[ErrorType.RoutingPolicy_Same_Path] = new WorkflowError({
            type: ErrorType.RoutingPolicy_Same_Path,
            message: "Cannnot have multiple Routing Policy nodes on the same path."
        });

        this.items[ErrorType.RoutingPolicy_Above_IVR] = new WorkflowError({
            type: ErrorType.RoutingPolicy_Above_IVR,
            message: "Cannot have a Routing Policy above an IVR node in the same path."
        });

        this.items[ErrorType.IVR_Node_On_Non_Call_Type] = new WorkflowError({
            type: ErrorType.IVR_Node_On_Non_Call_Type,
            message: "Cannot have IVR node on a non call type Worflow."
        });

        this.items[ErrorType.Workflow_Type_Call_Mismatch] = new WorkflowError({
            type: ErrorType.Workflow_Type_Call_Mismatch,
            message: "Found a call type node within a non call Workflow."
        });

        this.items[ErrorType.Workflow_Type_Chat_Mismatch] = new WorkflowError({
            type: ErrorType.Workflow_Type_Chat_Mismatch,
            message: "Found a chat type node within a non chat Workflow."
        });

        this.items[ErrorType.Workflow_Type_Internet_Mismatch] = new WorkflowError({
            type: ErrorType.Workflow_Type_Internet_Mismatch,
            message: "Found a internet type node within a non internet Workflow."
        });

        this.items[ErrorType.Workflow_Type_SMS_Mismatch] = new WorkflowError({
            type: ErrorType.Workflow_Type_SMS_Mismatch,
            message: "Found a sms type node within a non sms Workflow."
        });

        this.items[ErrorType.Key_Press_Has_No_Parent] = new WorkflowError({
            type: ErrorType.Key_Press_Has_No_Parent,
            message: "A Key Press node must have a parent."
        });

        this.items[ErrorType.Key_Press_Must_Have_IVR_Parent] = new WorkflowError({
            type: ErrorType.Key_Press_Must_Have_IVR_Parent,
            message: "A Key Press node must have an IVR node as its parent."
        });

        this.items[ErrorType.No_Key_Press_Has_No_Parent] = new WorkflowError({
            type: ErrorType.No_Key_Press_Has_No_Parent,
            message: "A No Key Press node must have a parent."
        });

        this.items[ErrorType.No_Key_Press_Must_Have_IVR_Parent] = new WorkflowError({
            type: ErrorType.No_Key_Press_Must_Have_IVR_Parent,
            message: "A No Key Press node must have an IVR node as its parent."
        });

        this.items[ErrorType.Real_Schedule_Has_No_Parent] = new WorkflowError({
            type: ErrorType.Real_Schedule_Has_No_Parent,
            message: "A Schedule node must have a parent."
        });

        this.items[ErrorType.Real_Schedule_Must_Have_ScheduledActions_Parent] = new WorkflowError({
            type: ErrorType.Real_Schedule_Must_Have_ScheduledActions_Parent,
            message: "A Schedule node must have an Scheduled Actions node as its parent."
        });

        this.items[ErrorType.Start_Node_Must_Have_Children] = new WorkflowError({
            type: ErrorType.Start_Node_Must_Have_Children,
            message: "A Schedule node must have a parent."
        });

        this.items[ErrorType.Invalid_Start_Node_Type] = new WorkflowError({
            type: ErrorType.Invalid_Start_Node_Type,
            message: "The start node's child must be of type Call, SMS, Internet, or Chat."
        });

        this.items[ErrorType.Workflow_Type_PLay_Message_Mismatch] = new WorkflowError({
            type: ErrorType.Workflow_Type_PLay_Message_Mismatch,
            message: "Cannot add a Play Message node to a non call/internet Workflow."
        });

        this.items[ErrorType.Workflow_Type_Hang_Up_Mismatch] = new WorkflowError({
            type: ErrorType.Workflow_Type_Hang_Up_Mismatch,
            message: "Connot add a Hang Up node to a nong call/internet Workflow."
        });
    }
}
