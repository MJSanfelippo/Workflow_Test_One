import * as _ from "lodash";
export class Utility {
  isDate(val: any): boolean {
    const d = new Date(val);
    return !isNaN(d.valueOf());
  }

  getBaseUrl(): string {
    const url = window.location.href;
    const arr = url.split("/");
    return `${arr[0] }//${ arr[2]}`;
  }

  delay(ms: number): Promise<() => void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateUUID(): string { // Public Domain/MIT
    let d = new Date().getTime();
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      d += performance.now(); // use high-precision timer if available
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c: string): string {
      
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  isFloat(value: any): boolean {
    const result = value.match(/^-?\d*(\.\d+)?$/);
    return !_.isNil(result);
  }
}
