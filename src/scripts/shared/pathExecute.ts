import { player } from '../../lib/player';
import { world } from '../../lib/world';
import { sleep, waitUntil } from '../../utils/waitUntil';

type ActionTypes = 'kill' | 'move' | 'use teleport' | 'use near teleport';

export interface IPath {
  actions: ActionTypes[];
  pos: [number, number];
}

export async function pathExecute(path: IPath[]) {
  for (const { actions, pos } of path) {
    if (actions.includes('kill')) {
      if (!pos) {
        return;
      }

      const [i, j] = pos;
      const npc = world.getObjectAt(i, j);

      if (npc && npc.b_t === BASE_TYPE.NPC) {
        await player.attackNpc(npc);
        await waitUntil(() => !players[0].temp.busy && !inAFight);
        await sleep(100);
      }
    }

    if (actions.includes('move')) {
      if (!pos) {
        return;
      }

      const [i, j] = pos;
      console.log('destroy');
      await world.destroyLootCrate(i, j);
      console.log('destroyed');

      await player.moveTo(i, j);
    }

    if (actions.includes('use teleport')) {
      if (!pos) {
        return;
      }

      const [i, j] = pos;
      await world.useTeleport(i, j);
    }

    if (actions.includes('use near teleport')) {
      await world.useTeleportNear();
    }
  }
}
