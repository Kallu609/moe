import { getFoodHealAmount } from '../lib/item';
import { player } from '../lib/player';
import { world } from '../lib/world';
import { IPosition } from '../types/game';
import { waitUntil } from '../utils/waitUntil';
import { IPath } from './shared/pathExecute';
import { ScriptBase } from './shared/scriptBase';

interface IFighterScriptOptions {
  npcName: string;
  foodName: string;
  chestPos: [number, number];
  criticalHpPercent: number;
}

export class SapphireDragonFighterScript extends ScriptBase {
  constructor(scriptName: string, private options: IFighterScriptOptions) {
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

    const path: IPath[] = [
      {
        actions: ['kill', 'move'],
        pos: [22, 86],
      },
      {
        actions: ['kill', 'move'],
        pos: [22, 89],
      },
      {
        actions: ['kill'],
        pos: [24, 89],
      },
      {
        actions: ['move', 'use near teleport'],
        pos: [24, 88],
      },
      {
        actions: ['sleep'],
        min: 500,
        max: 1500,
      },
      {
        actions: ['move'],
        pos: [24, 88],
      },
      {
        actions: ['move'],
        pos: [24, 87],
      },
      {
        actions: ['kill', 'move'],
        pos: [27, 86],
      },
      {
        actions: ['kill', 'move'],
        pos: [29, 87],
      },
    ];

    await this.pathExecute(path);
  };

  attackNpc = async () => {
    this.currentAction = 'Attacking NPC';
    await player.attackClosest(this.options.npcName);
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

  isCriticalHp = () => {
    return player.getHealthPercent() <= this.options.criticalHpPercent;
  };
}
