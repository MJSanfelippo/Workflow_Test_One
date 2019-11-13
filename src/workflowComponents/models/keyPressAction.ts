export class KeyPressAction {
  id: string;
  toBeRemoved: boolean;
  keyPress: string;
  allKeyPressOptions: string[];

  constructor(keyPress: string = "", id: string = "", toBeRemoved: boolean = false) {
    this.keyPress = keyPress;
    this.allKeyPressOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*"];
    if (this.keyPress.trim() === "") {
      this.keyPress = this.allKeyPressOptions[0];
    }
    this.id = id;
    this.toBeRemoved = toBeRemoved;
  }
}
