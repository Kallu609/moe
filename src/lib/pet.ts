import { waitUntil } from '../utils/waitUntil';
import { player } from './player';

export default {
  isFull() {
    if (!players[0].pet.enabled) {
      return true;
    }

    return !(
      pets[players[0].pet.id].params.inventory_slots -
      players[0].pet.chest.length
    );
  },

  hasItems() {
    if (!players[0].pet.enabled) {
      return false;
    }

    return players[0].pet.chest.length >= 1;
  },

  async load() {
    if (!players[0].pet.enabled) {
      return false;
    }

    const targetInvCount = Math.max(
      player.inventory.getUnequippedCount() -
        (pets[players[0].pet.id].params.inventory_slots -
          players[0].pet.chest.length),
      0
    );

    await waitUntil(() => !players[0].temp.busy);
    Socket.send('pet_chest_load', {});

    await waitUntil(
      () => player.inventory.getUnequippedCount() === targetInvCount
    );
    return true;
  },

  async unload() {
    if (!players[0].pet.enabled || !players[0].pet.chest.length) {
      return false;
    }

    const invItemCount = players[0].temp.inventory.length;
    const petItemCount = players[0].pet.chest.length;
    const targetInvCount =
      invItemCount + petItemCount > 40 ? 40 : invItemCount + petItemCount;

    Socket.send('pet_chest_unload', {});
    await waitUntil(() => players[0].temp.inventory.length === targetInvCount);

    return true;
  },
};
