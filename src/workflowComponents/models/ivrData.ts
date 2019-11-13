
export class IvrData {
  messageId: string;
  numberOfRepeat: number;

  constructor(messageId: string, numberOfRepeat: number) {
    this.messageId = messageId;
    this.numberOfRepeat = numberOfRepeat;
  }
}
