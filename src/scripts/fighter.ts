import { getFoodHealAmount } from '../lib/item';
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

  getAction = () => {
    if (player.inventory.getFoodCount() === 0) {
      return this.walkToChestAndWithdrawFood;
    }

    if (
      player.getMaxHp() - player.getCurrentHp() >
      getFoodHealAmount(this.options.food)
    ) {
      return this.eat;
    }

    if (inAFight) {
      return this.waitUntilFightDone;
    }

    return this.attackNpc;
  };

  attackNpc = async () => {
    this.currentAction = 'Attacking NPC';
    const npc = world.getClosestNpc(this.options.npcName);
    await player.attackNpc(npc.i, npc.j);
  };

  waitUntilFightDone = async () => {
    this.currentAction = 'Fighting';

    await waitUntil(() => !inAFight);
    await this.sleep(500, 2500);
  };

  walkToChestAndWithdrawFood = async () => {
    this.currentAction = 'Getting food';
    await player.moveTo(83, 37);
    await world.chest.open(83, 38);
    await world.chest.depositAll();

    if (!world.chest.getItemCount(this.options.food)) {
      this.stop();
    }
    await world.chest.withdraw(this.options.food);
    await this.sleep(3000, 10000);
  };

  eat = async () => {
    this.currentAction = 'Eating';
    await player.inventory.eatFood();
  };
}
