import * as _ from 'lodash';

import { customPathTo } from '../lib/path';
import { ScriptBase } from './shared/scriptBase';

const movementState = {
  done: 'done',
  monsterInWay: 'monster in way',
  runAway: 'fighting',
  failed: 'failed',
};

export class TesterScript extends ScriptBase {
  getAction() {
    return this.test;
  }

  test = async () => {
    /*while (true) {
      await sleep(500);

      const result = await moveToWithForce(24, 87);
      // const result = await moveToWithForce(79, 93);
      const [state, ...args] = result;

      if (state === movementState.monsterInWay) {
        console.log('voi vittu monsu');
        const [npc] = args;
        await player.attackNpc(npc);
        await player.waitUntilFightDone(70);

        if (player.isCriticalHp(70)) {
          await player.eatFood();
        }
      }

      if (state === movementState.runAway) {
        console.log('lol vittu jouduin tappelluu :D');
        await player.runFromFight();

        if (player.isCriticalHp(70)) {
          await player.eatFood();
        }

        continue;
      }

      if (state === movementState.done) {
        console.log('lol vittu meikä valmis xD');
        break;
      }

      if (state === movementState.failed) {
        console.log('ei vittu meikä failas');
        break;
      }
    }
    */

    const oldMapIncrease = map_increase;
    map_increase = 200;
    const path = customPathTo(60, 60, 'monsterAvoid');
    players[0].path = path;
    map_increase = oldMapIncrease;

    this.stop();
  };
}
