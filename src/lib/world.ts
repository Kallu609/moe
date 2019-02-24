import * as _ from 'lodash';

import { IObject } from '../types/game';
import { sortByDistance } from '../utils/math';
import { waitUntil } from '../utils/waitUntil';
import { itemNamesToIds, itemNameToId } from './game';
import { player } from './player';

export const world = {
  pathTo: (i: number, j: number) =>
    findPathFromTo(players[0], { i, j }, players[0]),

  waitForMap: (mapId: number | string) => {
    return waitUntil(
      () =>
        current_map === Number(mapId) &&
        !map_change_in_progress &&
        node_graphs[mapId]
    );
  },

  useTeleport: async (i: number, j: number) => {
    const target = on_map[current_map][i][j];

    Object.keys(players).forEach(key => {
      if (Number(key) !== 0) {
        delete players[key];
      }
    });
    Socket.send('teleport', { target_id: target.id });
    console.log(target.params);

    if (target.params && target.params.to_map) {
      console.log('waiting for map');
      await world.waitForMap(target.params.to_map);
      console.log('we at map');
    }
  },

  getObjectAt(i: number, j: number) {
    try {
      return obj_g(on_map[current_map][i][j]);
    } catch {
      return false;
    }
  },

  getNpcsById(id: number) {
    const npcs: IObject[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < on_map[current_map].length; i++) {
      for (let j = 0; j < on_map[current_map][0].length; j++) {
        const tile = on_map[current_map][i][j];
        if (tile && tile.b_i === id) {
          const obj = obj_g(on_map[current_map][i][j]);

          if (obj) {
            npcs.push(obj);
          }
        }
      }
    }

    return npcs;
  },

  getNpcsByName(name: string) {
    const npc = npc_base.find(x => x.name.toLowerCase() === name.toLowerCase());

    if (npc) {
      return world.getNpcsById(npc.b_i);
    }

    return [];
  },

  getClosestNpc(name: string): IObject {
    const playerPos = player.getPosition();
    const npcs = this.getNpcsByName(name);
    const closest = sortByDistance(playerPos, npcs)[0];

    return closest as IObject;
  },

  chest: {
    waitUntilOpened: () => waitUntil(() => Chest.is_open()),

    open: async (i: number, j: number) => {
      const chest = world.getObjectAt(i, j);

      if (chest) {
        DEFAULT_FUNCTIONS.access(chest, players[0]);
        await world.chest.waitUntilOpened();
      }
    },

    depositAllResources: async () => {
      const resourceIds = _.flatten(Object.values(Inventory.resources_list));
      const targetCount =
        player.inventory.getAllItemsCount() -
        resourceIds.reduce((acc, itemId) => {
          return acc + player.inventory.getItemCountById(itemId);
        });

      for (const item of players[0].temp.inventory) {
        if (resourceIds.includes(item.id)) {
          const itemCount = Inventory.get_item_count(players[0], item.id);

          Socket.send('chest_deposit', {
            item_id: item.id,
            item_slot: Number(selected_chest) + 60 * (chest_page - 1),
            target_id: chest_npc.id,
            target_i: chest_npc.i,
            target_j: chest_npc.j,
            amount: itemCount,
          });
        }
      }

      await waitUntil(
        () => player.inventory.getAllItemsCount() === targetCount
      );
    },

    depositAll: async () => {
      const targetCount =
        player.inventory.getAllItemsCount() -
        player.inventory.getUnequippedCount();

      Socket.send('chest_deposit_all', {
        target_id: chest_npc.id,
        target_i: chest_npc.i,
        target_j: chest_npc.j,
      });

      await waitUntil(
        () => player.inventory.getAllItemsCount() === targetCount
      );
    },

    depositItems: async (itemNames: string[]) => {
      const itemIds = itemNamesToIds(itemNames);
      const targetCount =
        player.inventory.getAllItemsCount() -
        itemIds.reduce((acc, itemId) => {
          return acc + player.inventory.getItemCountById(itemId);
        });

      for (const itemId of itemIds) {
        const itemCount = Inventory.get_item_count(players[0], itemId);

        Socket.send('chest_deposit', {
          item_id: itemId,
          item_slot: Number(selected_chest) + 60 * (chest_page - 1),
          target_id: chest_npc.id,
          target_i: chest_npc.i,
          target_j: chest_npc.j,
          amount: itemCount,
        });
      }

      await waitUntil(
        () => player.inventory.getAllItemsCount() === targetCount
      );
    },

    withdraw: async (itemName: string, amount = 40) => {
      const invCount = player.inventory.getAllItemsCount();
      const targetCount = invCount + amount > 40 ? 40 : invCount;
      const itemId = itemNameToId(itemName);

      if (!itemId) {
        return;
      }

      Socket.send('chest_withdraw', {
        item_id: itemId,
        item_slot: Chest.player_find_item_index(0, itemId),
        target_id: chest_npc.id,
        target_i: chest_npc.i,
        target_j: chest_npc.j,
        amount,
      });

      await waitUntil(
        () => player.inventory.getAllItemsCount() === targetCount
      );
    },
  },
};
