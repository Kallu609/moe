import * as _ from 'lodash';

import { log } from '../utils/logger';
import { waitUntil } from '../utils/waitUntil';
import { itemNameToId } from './game';
import { world } from './world';

export const player = {
  atPosition: (i: number, j: number) =>
    players[0].i === i && players[0].j === j,

  getPosition: () => {
    return { i: players[0].i, j: players[0].j };
  },

  moveToBlind: (i: number, j: number) => {
    const oldMapIncrease = map_increase;
    map_increase = 1000;
    players[0].path = world.pathTo(i, j);
    map_increase = oldMapIncrease;
  },

  moveTo: (i: number, j: number) => {
    if (!players[0]) {
      log(`Can't move to ${i}, ${j}. Can't find player`);
      return;
    }

    const moveThrottled = _.throttle(() => {
      const oldMapIncrease = map_increase;
      map_increase = 1000;
      players[0].path = world.pathTo(i, j);
      map_increase = oldMapIncrease;
    }, 1000);

    return waitUntil(() => {
      if (
        player.atPosition(i, j) &&
        !players[0].path.length &&
        !movementInProgress(players[0])
      ) {
        return true;
      }

      if (players[0].path.length === 0 && !movementInProgress(players[0])) {
        moveThrottled();
      }

      return false;
    });
  },

  attackNpc: async (i: number, j: number) => {
    player.moveToBlind(i, j);
    await waitUntil(() => players[0].path.length === 0);
    const atFightPosition = +new Date();
    await waitUntil(() => inAFight || +new Date() - atFightPosition > 500);
  },

  getMaxHp: () => skills[0].health.level,
  getCurrentHp: () => skills[0].health.current,
  getHealthPercent: () =>
    Math.floor((player.getCurrentHp() / player.getMaxHp()) * 100),

  eatFood: async () => {
    const startCount = player.inventory.getAllItemsCount();
    Player.eat_food();
    await waitUntil(
      () => player.inventory.getAllItemsCount() === startCount - 1
    );
  },

  inventory: {
    waitUntilFull: () => waitUntil(() => Inventory.is_full(players[0])),
    isFull: () => Inventory.is_full(players[0]),
    getAllItemsCount: () => players[0].temp.inventory.length,

    getItemCount: (itemName: string) => {
      const id = itemNameToId(itemName);
      return players[0].temp.inventory.filter(x => x.id === id).length;
    },

    getItemCountById: (itemId: number) => {
      return players[0].temp.inventory.filter(x => x.id === itemId).length;
    },

    getItemSlots: (itemName: string) => {
      const itemId = itemNameToId(itemName);
      return players[0].temp.inventory
        .map((item, i) => {
          if (item.id === itemId) {
            return i;
          }

          return -1;
        })
        .filter(x => x !== -1)
        .sort((a, b) => b - a);
    },

    getFoodCount: () => {
      return players[0].temp.inventory.filter(item => {
        return item_base[item.id].params.heal !== undefined;
      }).length;
    },

    getEquippedCount: () =>
      players[0].temp.inventory.filter(x => x.selected).length,

    getUnequippedCount: () =>
      players[0].temp.inventory.filter(x => !x.selected).length,

    equip: (slotId: number) => {
      Socket.send('unequip', { data: { id: slotId } });
      waitUntil(() => players[0].temp.inventory[slotId].selected);
    },

    unequip: (slotId: number) => {
      Socket.send('equip', { data: { id: slotId } });
      waitUntil(() => !players[0].temp.inventory[slotId].selected);
    },
  },

  pet: {
    isFull: () => {
      if (!players[0].pet.enabled) {
        return true;
      }

      return !(
        pets[players[0].pet.id].params.inventory_slots -
        players[0].pet.chest.length
      );
    },

    load: () => {
      if (!players[0].pet.enabled) {
        return;
      }

      const targetInventoryCount =
        player.inventory.getAllItemsCount() -
        (pets[players[0].pet.id].params.inventory_slots -
          players[0].pet.chest.length);

      Socket.send('pet_chest_load', {});
      return waitUntil(
        () => player.inventory.getAllItemsCount() === targetInventoryCount
      );
    },
    unload: () => {
      if (!players[0].pet.enabled) {
        return;
      }

      Socket.send('pet_chest_unload', {});
      return waitUntil(() => players[0].pet.chest.length === 0);
    },
  },

  mine: async (i: number, j: number) => {
    const rock = world.getObjectAt(i, j);

    if (rock) {
      while (!Inventory.is_full(players[0])) {
        DEFAULT_FUNCTIONS.mine(rock, players[0]);
        await waitUntil(() => !players[0].temp.busy);
      }
    }
  },
};
