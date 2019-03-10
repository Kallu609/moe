import { ws } from '../bot';
import { player } from '../lib/player';
import { world } from '../lib/world';
import { turnOnSleepMode } from '../utils/socket';
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
    if (
      !player.inventory.getItemCount(this.options.materialName) ||
      !player.inventory.getItemCount('forging hammer')
    ) {
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

    if (!player.inventory.getItemCount('forging hammer')) {
      await world.chest.withdraw('forging hammer', 1);
      await player.inventory.equip('forging hammer');
    }

    const itemsLeft = await world.chest.withdraw(this.options.materialName);

    if (!itemsLeft) {
      this.stop();
      return turnOnSleepMode();
    }

    await this.sleep(500, 1500);
  };
}
