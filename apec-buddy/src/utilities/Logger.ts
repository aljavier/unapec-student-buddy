
export class Logger {

  static DEBUG : boolean = true;

  static log(message: any) {
    if (Logger.DEBUG) {
      console.log(message);
    }
  }

  static error(message: string, error: string) {
    if (Logger.DEBUG) {
      console.error(message, error);
    }
  }
}
