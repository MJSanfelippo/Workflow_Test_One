export class Email {
  subject: string;
  body: string;
  to: string;

  constructor(subject: string, body: string, to: string) {
    this.subject = subject;
    this.body = body;
    this.to = to;
  }
}
