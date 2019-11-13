export class ActionsAllowed{
  ivrAllowed: boolean;
  hangUpAllowed: boolean;
  playMessageAllowed: boolean;

  constructor(ivrAllowed: boolean = false, hangUpAllowed: boolean = false, playMessageAllowed: boolean = false){
    this.ivrAllowed = ivrAllowed;
    this.hangUpAllowed = hangUpAllowed;
    this.playMessageAllowed = playMessageAllowed;
  }
}
