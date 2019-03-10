import { waitUntil } from '../utils/waitUntil';
import { itemIdFromName } from './item';

const botInventory = {
  waitUntilFull: () => waitUntil(() => Inventory.is_full(players[0])),
  isFull: () => Inventory.is_full(players[0]),
  getAllItemsCount: () => players[0].temp.inventory.length,
  getEquippedCount: () =>
    players[0].temp.inventory.filter(x => x.selected).length,
  getUnequippedCount: () =>
    players[0].temp.inventory.filter(x => !x.selected).length,
  getEmptyCount: () => 40 - players[0].temp.inventory.length,
  getItemIdsAndCounts: () => Inventory.get_item_counts(players[0]),

  getItemCount: (itemName: string) => {
    return Inventory.get_item_count(players[0], itemIdFromName(itemName));
  },

  getItemCountById: (itemId: number) => {
    return Inventory.get_item_count(players[0], itemId);
  },

  getFirstItemSlot: (item: string | number) => {
    const itemId = typeof item === 'number' ? item : itemIdFromName(item);
    let slotId = 0;

    for (const invItem of players[0].temp.inventory) {
      if (Number(invItem.id) === Number(itemId)) {
        return slotId;
      }

      slotId++;
    }

    return undefined;
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

  async consume(item: string | number) {
    const itemId = typeof item === 'number' ? item : itemIdFromName(item);

    if (!itemId) {
      return;
    }

    const targetInvCount = players[0].temp.inventory.length - 1;
    Socket.send('equip', { data: { id: itemId } });
    await waitUntil(() => players[0].temp.inventory.length === targetInvCount);
  },

  equip: async (item: string | number) => {
    const itemId = typeof item === 'number' ? item : itemIdFromName(item);

    if (!itemId) {
      return false;
    }

    const equipped = Inventory.equip(players[0], itemId);

    if (equipped) {
      const itemSlot = botInventory.getFirstItemSlot(itemId);

      if (!itemSlot) {
        return false;
      }

      BigMenu.init_inventory();
      Socket.send('equip', { data: { id: itemId } });
      Player.update_combat_attributes(players[0]);
      BigMenu.show_quiver();

      await waitUntil(() => players[0].temp.inventory[itemSlot].selected);
      return true;
    }

    return false;
  },

  async unequip(item: string | number) {
    const itemId = typeof item === 'number' ? item : itemIdFromName(item);

    if (!itemId) {
      return;
    }

    const equipped = Inventory.unequip(players[0], itemId);

    if (equipped) {
      const itemSlot = botInventory.getFirstItemSlot(itemId);

      if (!itemSlot) {
        return;
      }

      BigMenu.init_inventory();
      Socket.send('unequip', { data: { id: itemId } });
      Player.update_combat_attributes(players[0]);
      BigMenu.show_quiver();

      await waitUntil(() => players[0].temp.inventory[itemSlot].selected);
      return true;
    }

    return false;
  },
};

export default botInventory;
