import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from './shared/scriptBase';

interface IFletchGuildWcOptions {
  treePos: [number, number];
}

export class FletchGuildWcScript extends ScriptBase {
  pathToGuild = [[45, 57], [41, 77], [38, 78], [37, 79]];

  constructor(scriptName: string, private options: IFletchGuildWcOptions) {
    super(scriptName);
  }

  getAction() {
    if (Number(current_map) === 36) {
      if (player.inventory.getUnequippedCount() > 0) {
        return this.depositItems;
      }

      return this.walkToGuild;
    }

    if (player.inventory.isFull() && player.pet.isFull()) {
      return this.walkToChest;
    }

    return this.chopWood;
  }

  walkToGuild = async () => {
    this.currentAction = 'Walking to guild';
    await player.walkPath(this.pathToGuild);
    await world.useTeleport(36, 81);
    await this.sleep(1000, 1500);
  };

  walkToChest = async () => {
    this.currentAction = 'Walking to overworld';
    await world.useTeleport(36, 81);
    await this.sleep(1000, 1500);
    await player.walkPath(this.pathToGuild, true);
  };

  chopWood = async () => {
    this.currentAction = 'Chopping';
    const [i, j] = this.options.treePos;
    await player.useSkill(i, j, true);
  };

  depositItems = async () => {
    this.currentAction = 'Depositing items';
    await world.chest.open(48, 37);
    await world.chest.depositAll();
    await this.sleep(1500, 3000);
  };
}
