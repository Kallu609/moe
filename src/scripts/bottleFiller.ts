import { player } from '../lib/player';
import { world } from '../lib/world';
import { turnOnSleepMode } from '../utils/socket';
import { ScriptBase } from './shared/scriptBase';

// Run this in rakblood

export class BottleFillerScript extends ScriptBase {
  bottleNames = [
    'empty superior vial',
    'empty large vial',
    'empty medium vial',
    'empty small vial',
  ];

  getAction() {
    if (!this.getInventoryBottleCount()) {
      return this.withdrawBottles;
    }

    return this.fillBottles;
  }

  withdrawBottles = async () => {
    this.currentAction = 'Withdrawing bottles';
    await world.chest.open(38, 65);
    await world.chest.depositAll();

    if (!this.getChestBottleCount()) {
      return this.stop();
    }

    for (const bottleName of this.bottleNames) {
      await world.chest.withdraw(bottleName);

      if (player.inventory.isFull()) {
        break;
      }
    }

    await this.sleep(1000, 3000);
  };

  fillBottles = async () => {
    this.currentAction = 'Filling bottles';

    for (const bottleName of this.bottleNames) {
      const equipped = await player.inventory.equip(bottleName);

      if (!equipped) {
        continue;
      }

      await player.useSkill(36, 68);
    }
  };

  getChestBottleCount() {
    return this.bottleNames.reduce(
      (count, bottleName) => count + world.chest.getItemCount(bottleName),
      0
    );
  }

  getInventoryBottleCount() {
    return this.bottleNames.reduce(
      (count, bottleName) => count + player.inventory.getItemCount(bottleName),
      0
    );
  }
}
