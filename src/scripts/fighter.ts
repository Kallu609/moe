import { getFoodHealAmount } from '../lib/item';
import { player } from '../lib/player';
import { world } from '../lib/world';
import { IPosition } from '../types/game';
import { waitUntil } from '../utils/waitUntil';
import { ScriptBase } from './scriptBase';

interface IFighterScriptOptions {
  npcName: string;
  food: string;
  chest: {
    pos: IPosition;
    walkTo: IPosition;
  };
}

export class FighterScript extends ScriptBase {
  constructor(scriptName: string, private options: IFighterScriptOptions) {
    super(scriptName);
  }

  getAction = () => {
    if (player.inventory.getFoodCount() <= 5) {
      return this.walkToChestAndWithdrawFood;
    }

    if (
      player.getMaxHp() - player.getCurrentHp() >=
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

    const isCriticalHp = () => player.getHealthPercent() <= 50;
    await waitUntil(
      () => (!players[0].temp.busy && !inAFight) || isCriticalHp()
    );

    if (isCriticalHp()) {
      this.currentAction = 'Running away';
      await player.runFromFight();
      return;
    }

    await this.sleep(500, 2500);
  };

  walkToChestAndWithdrawFood = async () => {
    this.currentAction = 'Getting food';

    const { walkTo, pos: chestPos } = this.options.chest;
    await player.moveTo(walkTo.i, walkTo.j);
    await world.chest.open(chestPos.i, chestPos.j);
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
