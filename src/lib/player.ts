import * as _ from 'lodash';

import { IObject } from '../types/game';
import { log } from '../utils/logger';
import { sleep, waitUntil } from '../utils/waitUntil';
import { itemIdFromName } from './item';
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

  attackNpc: async (npc: IObject) => {
    Socket.send('set_target', { target: npc.id });
    player.moveToBlind(npc.i, npc.j);
    await waitUntil(() => players[0].path.length === 0);
    const atFightPosition = +new Date();
    await waitUntil(() => inAFight || +new Date() - atFightPosition > 500);
  },

  async runFromFight() {
    while (players[0].temp.busy || inAFight) {
      Socket.send('run_from_fight', {});
      await sleep(500);
    }
  },

  attackNpcWithBow: async (npc: IObject) => {
    const npcDead = () => {
      const currentObj = world.getObjectAt(npc.i, npc.j);
      return !currentObj || npc.id !== currentObj.id;
    };

    const arrowId = players[0].params.archery.id;
    const arrow = item_base[arrowId];

    if (!needsProximity(players[0], npc, arrow.params.archery_range)) {
      player.moveToBlind(npc.i, npc.j);

      // Dirty hack and will fail if theres aggressive monsters
      await waitUntil(() =>
        needsProximity(players[0], npc, arrow.params.archery_range)
      );
    }

    while (player.getQuiverAmmo() !== 0 && !npcDead()) {
      Archery.client_use(players[0], npc);
      await sleep(500);
      await waitUntil(() => timer_holder.shooting === undefined);

      const { collides } = Archery.bresenham_collision(
        player.getPosition(),
        { i: npc.i, j: npc.j },
        current_map
      );

      if (collides) {
        break;
      }
    }
  },

  getMaxHp: () => skills[0].health.level,
  getCurrentHp: () => skills[0].health.current,
  getHealthPercent: () =>
    Math.floor((player.getCurrentHp() / player.getMaxHp()) * 100),
  getQuiverAmmo: () => players[0].params.archery.count,
  isQuiverFull: () => player.getQuiverAmmo() >= players[0].params.archery.max,

  fillQuiver: async () => {
    const arrowId = players[0].params.archery.id;
    const arrowUses = item_base[arrowId].params.archery_uses;
    const arrowAmount = player.inventory.getItemCountById(arrowId);
    const needToFill =
      players[0].params.archery.max - players[0].params.archery.count;

    if (needToFill <= 0) {
      console.log('no need to fill');
      return;
    }

    const arrowsRequired = Math.ceil(needToFill / arrowUses);
    const arrowsToUseCount =
      arrowsRequired > arrowAmount ? arrowAmount : arrowsRequired;
    const targetArrowCount =
      players[0].params.archery.count + arrowsToUseCount * arrowUses;

    for (let i = 0; i < arrowsToUseCount; i++) {
      Socket.send('equip', { data: { id: arrowId } });
      await sleep(250);
    }

    await waitUntil(() => players[0].params.archery.count === targetArrowCount);
  },

  inventory: {
    waitUntilFull: () => waitUntil(() => Inventory.is_full(players[0])),
    isFull: () => Inventory.is_full(players[0]),
    getAllItemsCount: () => players[0].temp.inventory.length,
    getItemIdsAndCounts: () => Inventory.get_item_counts(players[0]),

    getItemCount: (itemName: string) => {
      return Inventory.get_item_count(players[0], itemIdFromName(itemName));
    },

    getItemCountById: (itemId: number) => {
      return Inventory.get_item_count(players[0], itemId);
    },

    getItemSlots: (itemName: string) => {
      const itemId = itemIdFromName(itemName);
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

    async eatFood() {
      const startHp = player.getCurrentHp();
      Player.eat_food();
      await waitUntil(() => player.getCurrentHp() > startHp + 2);
      await sleep(500);
    },

    getEquippedCount: () =>
      players[0].temp.inventory.filter(x => x.selected).length,

    getUnequippedCount: () =>
      players[0].temp.inventory.filter(x => !x.selected).length,

    equip: (slotId: number) => {
      Socket.send('equip', { data: { id: slotId } });
      waitUntil(() => players[0].temp.inventory[slotId].selected);
    },

    unequip: (slotId: number) => {
      Socket.send('unequip', { data: { id: slotId } });
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

  async mine(rockName: string) {
    const rock = world.getNearObjectByName('Coal');

    if (rock) {
      this.mineAt(rock.i, rock.j);
    }
  },

  async mineAt(i: number, j: number) {
    const rock = world.getObjectAt(i, j);

    if (!rock) {
      return;
    }

    while (!Inventory.is_full(players[0])) {
      const proximity = nearEachOther(rock, players[0]);

      if (!proximity) {
        break;
      }

      DEFAULT_FUNCTIONS.mine(rock, players[0]);
      await waitUntil(() => !players[0].temp.busy);
    }
  },
};
