import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from './shared/scriptBase';

interface IForgerOptions {
  produceName: string;
  materialName: string;
}

export class ForgerScript extends ScriptBase {
  constructor(scriptName: string, private options: IForgerOptions) {
    super(scriptName);
  }

  getAction() {
    if (!player.inventory.getItemCount(this.options.materialName)) {
      return this.withdraw;
    }

    return this.forge;
  }

  forge = async () => {
    this.currentAction = 'Forging';
    await player.moveTo(25, 20);
    await player.forge(this.options.produceName, 26, 20);
  };

  withdraw = async () => {
    this.currentAction = 'Withdrawing';
    await world.chest.open(22, 17);
    await world.chest.depositAll();
    await world.chest.withdraw(this.options.materialName);
    await this.sleep(500, 1500);
  };
}
