import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from './scriptBase';

export class MiningScript extends ScriptBase {
  getAction() {
    if (current_map === 0) {
      if (player.inventory.isFull() && player.pet.isFull()) {
        if (player.atPosition(83, 37)) {
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

      if (player.atPosition(67, 15)) {
        return this.startMining;
      }

      return this.walkToMiningSpot;
    }

    return this.stop;
  }

  async walkToMine() {
    await player.moveTo(66, 30);
    await world.useTeleport(66, 29);
  }

  async walkToMiningSpot() {
    await player.moveTo(69, 15);
    await player.moveTo(67, 15);
  }

  async startMining() {
    await player.mine(67, 14);
    await player.inventory.waitUntilFull();
    await player.pet.load();
    await player.mine(67, 14);
    await player.inventory.waitUntilFull();
  }

  async walkToOverWorld() {
    await player.moveTo(69, 15);
    await player.moveTo(67, 29);
    await world.useTeleport(66, 29);
  }

  async walkToBank() {
    await player.moveTo(83, 37);
  }

  async depositItems() {
    await world.chest.open(83, 38);
    await world.chest.depositAll();
    await player.pet.unload();
    await world.chest.depositAll();
  }
}
