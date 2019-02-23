import { IItemBaseItem } from '../types/items';
import { waitUntil } from '../utils/waitUntil';

export const waitForConnection = async () =>
  waitUntil(() => !!game_timestamp.connected && typeof Mods !== 'undefined');

export const itemNameToId = (itemName: string) => {
  const item = item_base.find(
    x => x.name.toLowerCase() === itemName.toLowerCase()
  );
  return item ? item.b_i : undefined;
};

export const itemNamesToIds = (itemNames: string[]) => {
  return itemNames
    .map(itemName => itemNameToId(itemName))
    .filter(x => x) as number[];
};
