import * as _ from 'lodash';

import { log } from '../utils/logger';
import { waitUntil } from '../utils/waitUntil';
import { itemNameToId } from './game';
import { world } from './world';

export const player = {
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
        players[0].i === i &&
        players[0].j === j &&
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

  moveToDir: (direction: 'nw' | 'ne' | 'sw' | 'se') => {
    touch_hold = 1;

    if (direction === 'nw') {
      touch_hold_i = -1;
    } else if (direction === 'se') {
      touch_hold_i = 1;
    } else if (direction === 'sw') {
      touch_hold_j = -1;
    } else if (direction === 'ne') {
      touch_hold_j = 1;
    }

    setTimeout(() => {
      touch_hold_i = 0;
      touch_hold_j = 0;
    }, 150);
  },

  inventory: {
    waitUntilFull: () => waitUntil(() => Inventory.is_full(players[0])),
    isFull: () => Inventory.is_full(players[0]),
    getItemCount: () => players[0].temp.inventory.length,
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
  },

  pet: {
    load: () => Socket.send('pet_chest_load', {}),
    unload: () => {
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
