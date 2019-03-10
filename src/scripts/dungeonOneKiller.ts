import combat from '../lib/combat';
import { getFoodHealAmount } from '../lib/item';
import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from './shared/scriptBase';

interface IDungeonOneKillerOptions {
  npcNames: string[];
  foodName: string;
  chestPos: [number, number];
  criticalHpPercent: number;
}

export class DungeonOneKillerScript extends ScriptBase {
  constructor(scriptName: string, private options: IDungeonOneKillerOptions) {
    super(scriptName);
  }

  getAction = () => {
    if (current_map === 0) {
      if (
        !player.inventory.getFoodCount() ||
        !player.inventory.getItemCount('dorpat teleport')
      ) {
        return this.withdrawGear;
      }

      return this.goToDungeon;
    }

    if (player.inventory.getFoodCount() === 0) {
      return this.useTeleport;
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

  goToDungeon = async () => {
    this.currentAction = 'Going to dungeon';

    await this.pathExecute(`
      set critical hp [${this.options.criticalHpPercent}]

      // To dungeon 1
      use teleport [25, 88]
      sleep [1000, 2000]

      // Traverse to dragons
      move [24, 87]
      kill [27, 86]
      kill [29, 87]
      move [37, 87]
      kill [41, 87]
      kill [45, 87]
      kill [48, 89]
      kill [50, 88]
      kill [53, 88]
      kill [56, 88]
      kill [59, 87]
      kill [64, 88]
      kill, move [69, 88]
      kill [70, 93]
      kill [73, 93]
      kill [76, 93]
      kill [79, 93]
    `);

    await this.sleep(1000, 2000);
  };

  attackNpc = async () => {
    this.currentAction = 'Attacking NPC';
    await combat.attackClosest(this.options.npcNames);
  };

  waitUntilFightDone = async () => {
    this.currentAction = 'Fighting';
    await combat.waitUntilFightDone(this.options.criticalHpPercent);
    await this.sleep(500, 2500);
  };

  useTeleport = async () => {
    this.currentAction = 'Teleporting';
    await player.inventory.consume('dorpat teleport');
    await world.waitForMap(0);
    await this.sleep(1000, 3000);
  };

  withdrawGear = async () => {
    this.currentAction = 'Getting food';
    const { chestPos, foodName } = this.options;
    const [i, j] = chestPos;

    await world.chest.open(i, j);
    await world.chest.depositAll();

    if (
      !world.chest.getItemCount(foodName) ||
      !world.chest.getItemCount('dorpat teleport')
    ) {
      return this.stop();
    }

    await world.chest.withdraw('dorpat teleport', 1);
    await world.chest.withdraw(foodName);
    await this.sleep(2000, 6000);
  };

  eat = async () => {
    this.currentAction = 'Eating';
    await player.eatFood();
  };
}
