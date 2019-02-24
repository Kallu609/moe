import { player } from '../lib/player';
import { ScriptBase } from './scriptBase';

export class TesterScript extends ScriptBase {
  getAction() {
    return this.test;
  }

  async test() {
    player.moveTo(83, 28);
    this.stop();
  }
}
