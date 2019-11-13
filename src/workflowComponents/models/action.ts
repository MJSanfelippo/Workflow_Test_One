import { ActionIcon } from "./actionIcon";
import { ActionsAllowed } from "./actionsAllowed";

export class Action {
  chosenActionIcon: ActionIcon;
  allActionIconOptions: ActionIcon[];
  id: string;
  toBeRemoved: boolean;
  actionsAllowed: ActionsAllowed;

  constructor(id: string, chosenActionIcon: ActionIcon, actionsAllowed: ActionsAllowed, toBeRemoved: boolean = false) {
    this.id = id;
    const scheduledActionsOption = new ActionIcon("Scheduled Actions", "&#xf126;"); // fa-code-fork
    const sendSmsOption = new ActionIcon("Send SMS", "&#xf10b;"); // fa-mobile
    const delayOption = new ActionIcon("Delay", "&#xf254;"); // fa-hourglass
    const sendEmailOption = new ActionIcon("Send Email", "&#xf0e0;"); // fa-envelope
    const playMessageOption = new ActionIcon("Play Message", "&#xf028;"); // fa-volume-up
    this.toBeRemoved = toBeRemoved;
    const ivrOption = new ActionIcon("IVR", "&#xf098;"); // fa-phone-square
    const routingPolicyOption = new ActionIcon("Routing Policy", "&#xf022;"); // fa-list-alt
    const hangUpOption = new ActionIcon("Hang Up", "&#xf3dd;");
    this.allActionIconOptions = [sendSmsOption, scheduledActionsOption, delayOption, sendEmailOption, routingPolicyOption];
    this.actionsAllowed = actionsAllowed;
    this.addOptionalActions(ivrOption, hangUpOption, playMessageOption);

    if (chosenActionIcon) {
      this.allActionIconOptions.forEach(actionIconOption => {
        if (actionIconOption.actionName === chosenActionIcon.actionName) {
          this.chosenActionIcon = actionIconOption;
        }
      });
    } else {
      this.chosenActionIcon = this.allActionIconOptions[0];
    }
  }

  private addOptionalActions(ivrOption: ActionIcon, hangUpOption: ActionIcon, playMessageOption: ActionIcon): void {
    if (this.actionsAllowed.ivrAllowed) {
      this.allActionIconOptions.push(ivrOption);
    }
    if (this.actionsAllowed.hangUpAllowed) {
      this.allActionIconOptions.push(hangUpOption);
    }
    if (this.actionsAllowed.playMessageAllowed) {
      this.allActionIconOptions.push(playMessageOption);
    }
  }
}
