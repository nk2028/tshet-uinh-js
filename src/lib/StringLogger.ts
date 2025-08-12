export class StringLogger {
  private res: string[];
  public enable: boolean;

  constructor(enable = false) {
    this.res = [];
    this.enable = enable;
  }

  log(str: string): void {
    if (!this.enable) return;
    this.res.push(str);
  }

  popAll(): string[] {
    const res = [...this.res];
    this.res.length = 0;
    return res;
  }
}

export const defaultLogger = new StringLogger();
