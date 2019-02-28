import { ScriptBase } from './shared/scriptBase';

export class TesterScript extends ScriptBase {
  getAction() {
    return this.test;
  }

  test = async () => {
    this.stop();
  };
}
