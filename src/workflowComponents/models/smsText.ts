export class SmsText {
  textToSend: string;
  phoneNumberToSendTo: string;

  constructor(textToSend: string, phoneNumberToSendTo: string) {
    this.textToSend = textToSend;
    this.phoneNumberToSendTo = phoneNumberToSendTo;
  }
}
