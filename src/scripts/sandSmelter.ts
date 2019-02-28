import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from './shared/scriptBase';

export class SandSmelterScript extends ScriptBase {
  getAction() {
    if (player.inventory.getItemCount('sand') < 2) {
      return this.withdrawSand;
    }

    return this.smeltSand;
  }

  withdrawSand = async () => {
    this.currentAction = 'Withdrawing sand';
    await world.chest.open(22, 17);

    if (world.chest.getItemCount('sand') <= 1) {
      return this.stop();
    }

    await world.chest.depositAll();

    const itemsLeft = await world.chest.withdraw('sand');

    if (itemsLeft) {
      await player.pet.load();
      await world.chest.withdraw('sand');
    }

    await this.sleep(1000, 3000);
  };

  smeltSand = async () => {
    this.currentAction = 'Smelting sand';
    await player.inventory.equip('sand');

    await player.useSkill(22, 24);

    while (player.pet.hasItems()) {
      if (await player.pet.unload()) {
        await player.useSkill(22, 24);
      }
    }
  };
}
