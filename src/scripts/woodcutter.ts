import { player } from '../lib/player';
import { world } from '../lib/world';
import { sleepRandom } from '../utils/waitUntil';
import { ScriptBase } from './shared/scriptBase';

interface IWoodcutterOptions {
  treePos: [number, number];
  nearChestPos: [number, number];
}

export class WoodcutterScript extends ScriptBase {
  constructor(scriptName: string, private options: IWoodcutterOptions) {
    super(scriptName);
  }

  getAction() {
    if (player.inventory.isFull()) {
      return this.deposit;
    }

    if (player.getPosition().i !== 71 && player.getPosition().j !== 33) {
      return this.moveToTree;
    }

    return this.hack;
  }

  moveToTree = async () => {
    await player.moveTo(64, 41);
    await sleepRandom(200, 800);
    await player.moveTo(66, 41);
    await sleepRandom(200, 800);
    await player.moveTo(67, 39);
    await sleepRandom(200, 800);
    await player.moveTo(67, 37);
    await sleepRandom(200, 800);
    await player.moveTo(66, 37);
    await sleepRandom(200, 800);
    await player.moveTo(66, 34);
    await sleepRandom(200, 800);
    await player.moveTo(71, 34);
    await sleepRandom(200, 800);
  };

  hack = async () => {
    this.currentAction = 'Chopping' + Math.random().toFixed(5);
    const [i, j] = this.options.treePos;

    await player.useSkill(71, 32);

    if (await player.pet.load()) {
      await player.useSkill(71, 32);
    }
  };

  deposit = async () => {
    this.currentAction = 'Depositing';
    const [i, j] = this.options.nearChestPos;
    await player.moveTo(71, 34);
    await sleepRandom(200, 800);
    await player.moveTo(66, 34);
    await sleepRandom(200, 800);
    await player.moveTo(66, 37);
    await sleepRandom(200, 800);
    await player.moveTo(67, 37);
    await sleepRandom(200, 800);
    await player.moveTo(67, 39);
    await sleepRandom(200, 800);
    await player.moveTo(66, 41);
    await sleepRandom(200, 800);
    await player.moveTo(64, 41);
    await sleepRandom(200, 800);
    await player.moveTo(64, 44);
    await sleepRandom(200, 800);

    await player.moveTo(61, 60);
    await world.chest.openNear();
    await world.chest.depositAll();
    await this.sleep(1000, 1500);
  };
}
