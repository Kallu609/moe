import * as _ from 'lodash';

import { player } from '../lib/player';
import { world } from '../lib/world';
import { sleep, waitUntil } from '../utils/waitUntil';
import { ScriptBase } from './scriptBase';

interface IFighterScriptOptions {
  npcName: string;
  food: string;
}

export class FighterScript extends ScriptBase {
  constructor(scriptName: string, private options: IFighterScriptOptions) {
    super(scriptName);
  }
  getAction() {
    if (player.inventory.getFoodCount() === 0) {
      console.log(player.inventory.getFoodCount(), players[0].temp.inventory);
      return this.walkToChestAndWithdrawFood;
    }

    if (player.getMaxHp() - player.getCurrentHp() > 12) {
      return this.eat;
    }

    if (inAFight) {
      return this.waitUntilFightDone;
    }

    return this.attackNpc;
  }

  attackNpc = async () => {
    this.currentAction = 'Attacking NPC';
    const npc = world.getClosestNpc(this.options.npcName);
    await player.attackNpc(npc.i, npc.j);
  };

  waitUntilFightDone = async () => {
    this.currentAction = 'Waiting fight end';
    await waitUntil(() => !inAFight);
    await sleep(_.random(500, 1500));
  };

  walkToChestAndWithdrawFood = async () => {
    this.currentAction = 'Getting food';
    await player.moveTo(83, 37);
    await world.chest.open(83, 38);
    await world.chest.depositAll();
    await world.chest.withdraw(this.options.food);
    await sleep(_.random(3000, 10000));
  };

  eat = async () => {
    this.currentAction = 'Eating';
    player.eatFood();
  };
}
