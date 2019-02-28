import { player } from '../../lib/player';
import { world } from '../../lib/world';
import { sleep, waitUntil } from '../../utils/waitUntil';
import { ScriptBase } from './scriptBase';

type ActionTypes =
  | 'kill'
  | 'move'
  | 'use teleport'
  | 'use near teleport'
  | 'sleep';

export interface IPath {
  actions: ActionTypes[];
  pos?: [number, number];
  min?: number;
  max?: number;
}

export class PathExecutor {
  constructor(private script: ScriptBase) {}

  pathExecute = async (path: IPath[]) => {
    for (const { actions, pos, min, max } of path) {
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
          await world.destroyLootCrate(i, j);
        }
      }

      if (actions.includes('move')) {
        if (!pos) {
          return;
        }

        const [i, j] = pos;
        await world.destroyLootCrate(i, j);
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

      if (actions.includes('sleep')) {
        if (!min || !max) {
          return;
        }

        await this.script.sleep(min, max);
      }
    }
  };
}
