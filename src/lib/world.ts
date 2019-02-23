import { waitUntil } from '../utils/waitUntil';
import { itemNamesToIds, itemNameToId } from './game';

export const world = {
  pathTo: (x: number, y: number) => {
    const path = findPathFromTo(players[0], { i: x, j: y }, players[0]);
    return path;
  },

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

    if (target.params && target.params.to_map) {
      await world.waitForMap(target.params.to_map);
    }
  },

  getObjectAt(i: number, j: number) {
    return objects_data.find(obj => obj && obj.i === i && obj.j === j);
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

    depositItems: (itemNames: string[]) => {
      const itemIds = itemNamesToIds(itemNames);

      for (const itemId of itemIds) {
        const itemCount = Inventory.get_item_count(players[0], itemId);

        Socket.send('chest_deposit', {
          item_id: itemId,
          item_slot: 0,
          target_id: chest_npc.id,
          target_i: chest_npc.i,
          target_j: chest_npc.j,
          amount: itemCount,
        });
      }
    },

    withdraw: (itemName: string, amount = 40) => {
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
    },
  },
};
