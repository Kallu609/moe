import { getFoodHealAmount } from '../lib/item';
import { player } from '../lib/player';
import { world } from '../lib/world';
import { IPosition } from '../types/game';
import { waitUntil } from '../utils/waitUntil';
import { ScriptBase } from './shared/scriptBase';

interface IFighterScriptOptions {
  npcName: string;
  foodName: string;
  criticalHpPercent: number;
  chestPos: [number, number];
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
      getFoodHealAmount(this.options.foodName)
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
    await player.attackNpc(npc);
  };

  waitUntilFightDone = async () => {
    this.currentAction = 'Fighting';

    await waitUntil(
      () => (!players[0].temp.busy && !inAFight) || this.isCriticalHp()
    );

    if (this.isCriticalHp()) {
      this.currentAction = 'Running away';
      await player.runFromFight();
      return;
    }

    await this.sleep(500, 2500);
  };

  walkToChestAndWithdrawFood = async () => {
    this.currentAction = 'Getting food';
    const { chestPos, foodName } = this.options;
    const [i, j] = chestPos;

    await world.chest.open(i, j);
    await world.chest.depositAll();

    if (!world.chest.getItemCount(foodName)) {
      return this.stop();
    }

    await world.chest.withdraw(foodName);
    await this.sleep(2000, 6000);
  };

  eat = async () => {
    this.currentAction = 'Eating';
    await player.eatFood();
  };

  isCriticalHp = () => {
    return player.getHealthPercent() <= this.options.criticalHpPercent;
  };
}
