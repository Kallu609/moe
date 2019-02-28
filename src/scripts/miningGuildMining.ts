import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from './shared/scriptBase';

export class MiningGuildScript extends ScriptBase {
  getAction() {
    if (current_map === 0) {
      if (player.inventory.isFull() && player.pet.isFull()) {
        return this.depositItems;
      }

      return this.walkToMine;
    }

    if (current_map === 1) {
      if (player.inventory.isFull() && player.pet.isFull()) {
        return this.walkToOverWorld;
      }

      return this.startMining;
    }

    return this.stop;
  }

  walkToMine = async () => {
    this.currentAction = 'Walking to mine';
    await player.moveTo(57, 14);
    await world.useTeleportNear();
    await this.sleep(500, 2000);
  };

  startMining = async () => {
    this.currentAction = 'Mining';
    await player.useSkill(36, 15);

    if (await player.pet.load()) {
      await player.useSkill(36, 15);
    }
  };

  walkToOverWorld = async () => {
    this.currentAction = 'Walking to overworld';
    await world.useTeleport(31, 15);
    await this.sleep(500, 2000);
  };

  depositItems = async () => {
    this.currentAction = 'Depositing items';
    await player.moveTo(22, 18);
    await world.chest.openNear();
    await world.chest.depositAll();
    await this.sleep(3000, 7000);
  };
}
