import { player } from '../lib/player';
import { world } from '../lib/world';
import { sleep } from '../utils/waitUntil';
import { ScriptBase } from './shared/scriptBase';

interface IShopBuyerScriptOptions {
  itemName: string;
}

export class ShopBuyerScript extends ScriptBase {
  constructor(scriptName: string, private options: IShopBuyerScriptOptions) {
    super(scriptName);
  }

  getAction() {
    if (player.inventory.isFull()) {
      return this.deposit;
    }

    return this.buy;
  }

  buy = async () => {
    this.currentAction = 'Buying items';
    await world.shop.open(32, 13);

    while (!(player.inventory.isFull() && player.pet.isFull())) {
      await world.shop.buyMax(this.options.itemName);

      if (await player.pet.load()) {
        await world.shop.buyMax(this.options.itemName);
      }

      await sleep(500);
    }
  };

  deposit = async () => {
    this.currentAction = 'Depositing items';
    await world.chest.open(22, 17);
    await world.chest.depositAll();
    await this.sleep(750, 1500);
  };
}
