import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from './scriptBase';

export class MiningGuildScript extends ScriptBase {
  getAction() {
    if (current_map === 0) {
      if (player.inventory.isFull() && player.pet.isFull()) {
        if (player.atPosition(22, 18)) {
          return this.depositItems;
        }

        return this.walkToBank;
      }

      return this.walkToMine;
    }

    if (current_map === 1) {
      if (player.inventory.isFull() && player.pet.isFull()) {
        return this.walkToOverWorld;
      }

      if (player.atPosition(36, 16)) {
        return this.startMining;
      }

      return this.walkToMiningSpot;
    }

    return this.stop;
  }

  walkToMine = async () => {
    this.currentAction = 'Walking to mine';
    await player.moveTo(57, 14);
    await world.useTeleport();
    await this.sleep(500, 2000);
  };

  walkToMiningSpot = async () => {
    this.currentAction = 'Walking to mining spot';
    await player.moveTo(36, 16);
  };

  startMining = async () => {
    this.currentAction = 'Mining';
    await player.mine('Coal');
    await player.inventory.waitUntilFull();
    await player.pet.load();
    await player.mine('Coal');
    await player.inventory.waitUntilFull();
  };

  walkToOverWorld = async () => {
    this.currentAction = 'Walking to overworld';
    await player.moveTo(31, 16);
    await world.useTeleport();
    await this.sleep(500, 2000);
  };

  walkToBank = async () => {
    this.currentAction = 'Walking to bank';
    await player.moveTo(22, 18);
  };

  depositItems = async () => {
    this.currentAction = 'Depositing items';
    await world.chest.open();
    await world.chest.depositAll();
    await this.sleep(3000, 7000);
  };
}
