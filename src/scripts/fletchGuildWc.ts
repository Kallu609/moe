import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from './shared/scriptBase';

interface IFletchGuildWcOptions {
  treePos: [number, number];
}

export class FletchGuildWcScript extends ScriptBase {
  pathToGuild = `
    move [46,53]
    move [45,57]
    move [43,68]
    move [41,77]
    move [37,77]
    teleport [36,81]
  `;

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
    await this.pathExecute(this.pathToGuild);
  };

  walkToChest = async () => {
    this.currentAction = 'Walking to overworld';
    await this.pathExecute(this.pathToGuild, true);
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
