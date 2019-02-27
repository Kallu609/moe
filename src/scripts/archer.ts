import { itemIdFromName } from '../lib/item';
import { player } from '../lib/player';
import { world } from '../lib/world';
import { IObject, IPosition } from '../types/game';
import { sortByDistance } from '../utils/math';
import { waitUntil } from '../utils/waitUntil';
import { ScriptBase } from './scriptBase';

interface IFighterScriptOptions {
  npcName: string;
  arrowName: string;
  chestPos: IPosition;
}

export class ArcheryScript extends ScriptBase {
  constructor(scriptName: string, private options: IFighterScriptOptions) {
    super(scriptName);
  }

  getAction = () => {
    if (player.getQuiverAmmo() >= 50) {
      return this.attackNpc;
    }

    if (
      player.getQuiverAmmo() <= 50 &&
      !player.inventory.getItemCount(this.options.arrowName)
    ) {
      return this.getArrows;
    }

    return this.fillQuiver;
  };

  attackNpc = async () => {
    this.currentAction = 'Attacking NPC';

    const playerPos = player.getPosition();
    const closestNpcs = world.getClosestNpcsSorted(this.options.npcName);
    const closestNpc = closestNpcs[0];
    const archeryRange =
      item_base[itemIdFromName(this.options.arrowName) as number].params
        .archery_range;

    const atAttackRange = () => {
      const distanceToClosestNpc = distance(
        playerPos.i,
        playerPos.j,
        closestNpc.i,
        closestNpc.j
      );
      return distanceToClosestNpc <= archeryRange;
    };

    if (!atAttackRange()) {
      player.moveToBlind(closestNpc.i, closestNpc.j);
      await waitUntil(() => atAttackRange());
    }

    for (const npc of closestNpcs) {
      const npcPos = { i: npc.i, j: npc.j };
      const { collides } = Archery.bresenham_collision(
        playerPos,
        npcPos,
        current_map
      );

      if (!collides) {
        await player.attackNpcWithBow(npc);
        break;
      }
    }

    await this.sleep(500, 2000);
  };

  fillQuiver = async () => {
    this.currentAction = 'Filling quiver';
    await player.fillQuiver();
  };

  getArrows = async () => {
    this.currentAction = 'Getting more arrows';
    await player.moveTo(this.options.chestPos.i, this.options.chestPos.j);
    await world.chest.openNear();

    if (!world.chest.getItemCount(this.options.arrowName)) {
      return this.stop();
    }

    while (!player.isQuiverFull()) {
      await world.chest.withdraw(this.options.arrowName);
      await this.fillQuiver();
    }

    await world.chest.withdraw(this.options.arrowName);
    await this.sleep(3000, 6000);
  };
}
