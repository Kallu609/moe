import * as _ from 'lodash';

import { IObject } from '../types/game';
import { sleep, waitUntil } from '../utils/waitUntil';
import { player } from './player';
import { world } from './world';

export default {
  async attackNpc(npc: IObject) {
    if (!nearEachOther(npc, players[0])) {
      const closestPos = world.getNearestWalkablePosition(npc);

      if (!closestPos) {
        await sleep(1000);
        return;
      }

      player.moveToBlind(closestPos.i, closestPos.j);
    }

    Socket.send('set_target', { target: npc.id });
    await waitUntil(
      () =>
        inAFight || !players[0].path.length || world.someoneElseFighting(npc)
    );
    await sleep(500);
  },

  async attackClosest(npcNames: string | string[]) {
    npcNames = _.isArray(npcNames) ? npcNames : [npcNames];
    const npcs = world.getClosestNpcsSorted(npcNames);

    for (const npc of npcs) {
      if (!world.someoneElseFighting(npc)) {
        await this.attackNpc(npc);
        await sleep(500);
        return true;
      }
    }

    await sleep(500);
    return false;
  },

  async attackNpcWithBow(npc: IObject) {
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

  async waitUntilFightDone(criticalHpPercent?: number) {
    await waitUntil(
      () =>
        (!players[0].temp.busy && !inAFight) ||
        player.isCriticalHp(criticalHpPercent)
    );

    if (player.isCriticalHp(criticalHpPercent)) {
      return this.runFromFight();
    }
  },

  async runFromFight() {
    while (players[0].temp.busy || inAFight) {
      Socket.send('run_from_fight', {});
      await sleep(500);
    }
  },
};
