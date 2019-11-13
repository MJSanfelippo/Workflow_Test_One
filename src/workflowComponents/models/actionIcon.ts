export class ActionIcon {
  actionName: string;
  iconHex: string;

  constructor(actionName: string, iconHex: string) {
    this.actionName = actionName;
    this.iconHex = iconHex;
  }

  getActionNameAndIconHex() {
    return `${this.iconHex }&nbsp;&nbsp;&nbsp;${ this.actionName}`;
  }
}

