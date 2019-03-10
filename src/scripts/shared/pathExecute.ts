import combat from '../../lib/combat';
import { player } from '../../lib/player';
import { world } from '../../lib/world';
import { sleep, sleepRandom } from '../../utils/waitUntil';
import { ScriptBase } from './scriptBase';

type ActionArguments = Array<string | number> | undefined;

export interface IPath {
  actions: string[];
  args: ActionArguments;
}

export class PathExecutor {
  stopFlag = false;
  private criticalHpPercent: number;

  constructor(private script: ScriptBase) {}

  pathExecute = async (pathText: string) => {
    const path = this.loadPath(pathText);

    for (const { actions, args } of path) {
      for (const action of actions) {
        if (this.stopFlag) {
          this.stopFlag = false;
          return;
        }

        console.log(action, args);
        await this.processAction(action, args);
      }
    }
  };

  private loadPath(pathText: string) {
    const path: IPath[] = [];

    for (let line of pathText.split('\n')) {
      line = line.trim().replace(/ +(?= )/g, '');

      if (!line || line.startsWith('//')) {
        continue;
      }

      const actions = line
        .split('[')[0]
        .split(',')
        .map(action => action.trim());

      const args = line.includes('[')
        ? line
            .split('[')[1]
            .split(']')[0]
            .split(',')
            .map(arg => (!isNaN(+arg.trim()) ? Number(arg.trim()) : arg))
        : undefined;

      path.push({
        actions,
        args,
      });
    }

    return path;
  }

  private processAction = async (action: string, args: ActionArguments) => {
    if (action === 'set critical hp') {
      if (!args) {
        return;
      }

      const [criticalHpPercent] = args as number[];
      this.criticalHpPercent = criticalHpPercent;
    }

    if (action === 'kill') {
      if (!args) {
        return;
      }

      const [i, j] = args as number[];
      let npc = world.getObjectAt(i, j);

      if (!world.pathTo(i, j).length) {
        return;
      }

      while (npc && npc.b_t === BASE_TYPE.NPC) {
        if (player.isCriticalHp(this.criticalHpPercent)) {
          if (player.inventory.getFoodCount() === 0) {
            await this.script.stop();
            await player.logout();
            this.stopFlag = true;
          }

          await player.eatFood();
          await sleepRandom(500, 1000);
        }

        await combat.attackNpc(npc);
        await combat.waitUntilFightDone(this.criticalHpPercent);
        npc = world.getObjectAt(i, j);
      }

      await sleep(100);
      return world.destroyLootCrate(i, j);
    }

    if (action === 'move') {
      if (!args) {
        return;
      }

      const [i, j] = args as number[];
      return world.destroyLootCrate(i, j);
    }

    if (action === 'use teleport') {
      if (!args) {
        return;
      }

      const [i, j] = args as number[];
      return world.useTeleport(i, j);
    }

    if (action === 'use near teleport') {
      return world.useTeleportNear();
    }

    if (action === 'sleep') {
      if (!args) {
        return;
      }

      const [min, max] = args as number[];
      return this.script.sleep(min, max);
    }
  };
}
