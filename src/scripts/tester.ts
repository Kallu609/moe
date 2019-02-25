import { world } from '../lib/world';
import { ScriptBase } from './scriptBase';

export class TesterScript extends ScriptBase {
  getAction() {
    return this.test;
  }

  test = async () => {
    await world.useTeleport();
    this.stop();
  };
}
