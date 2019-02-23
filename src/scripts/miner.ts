import { player } from '../lib/player';
import { world } from '../lib/world';

const items = [
  'iron ore',
  'uncut superior grade emerald',
  'uncut high grade emerald',
  'uncut medium grade emerald',
  'uncut low grade emerald',
];

export const minerScript = {
  run: async () => {
    while (true) {
      if (current_map === 0) {
        if (Inventory.is_full(players[0])) {
          await depositItems();
        }

        await walkToMine();
      }

      await startMining();
      await walkToBank();
      await depositItems();
    }
  },
};

async function walkToMine() {
  await player.moveTo(66, 30);
  await world.useTeleport(66, 29);
  await player.moveTo(69, 15);
  await player.moveTo(67, 15);
}

async function startMining() {
  await player.mine(67, 14);
  await player.inventory.waitUntilFull();
  await player.pet.load();
  await player.mine(67, 14);
  await player.inventory.waitUntilFull();
}

async function walkToBank() {
  await player.moveTo(69, 15);
  await player.moveTo(67, 29);
  await world.useTeleport(66, 29);
  await player.moveTo(83, 37);
}

async function depositItems() {
  await world.chest.open(83, 38);
  await world.chest.depositItems(items);
  await player.pet.unload();
  await world.chest.depositItems(items);
}
