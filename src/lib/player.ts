import * as _ from 'lodash';

import { IPosition } from '../types/game';
import { sleep, waitUntil } from '../utils/waitUntil';
import combat from './combat';
import botInventory from './inventory';
import { itemIdFromName } from './item';
import pet from './pet';
import { world } from './world';

export const player = {
  inventory: botInventory,
  pet,
  combat,

  logout() {
    Player.client_logout();
  },

  atPosition(i: number, j: number) {
    return players[0].i === i && players[0].j === j;
  },

  getPosition() {
    return { i: players[0].i, j: players[0].j };
  },

  setPathTo(path: IPosition[]) {
    const oldMapIncrease = map_increase;
    map_increase = 200;
    players[0].path = path;
    map_increase = oldMapIncrease;
  },

  isMoving: () => players[0].path.length || movementInProgress(players[0]),

  moveToBlind(i: number, j: number) {
    const oldMapIncrease = map_increase;
    map_increase = 200;
    players[0].path = world.pathTo(i, j);
    map_increase = oldMapIncrease;
  },

  moveToPos(pos: IPosition) {
    return player.moveTo(pos.i, pos.j);
  },

  async moveTo(i: number, j: number, safe?: boolean) {
    if (!players[0]) {
      return;
    }

    let lastPathSet;

    while (true) {
      if (player.atPosition(i, j) && !player.isMoving()) {
        break;
      }

      if (!player.isMoving() && !inAFight) {
        const now = +new Date();
        const canSetPath =
          lastPathSet === undefined || now - lastPathSet > 1000;

        if (canSetPath) {
          const path = world.pathTo(i, j, safe);

          if (!path) {
            console.log('Path not found');
          }

          player.setPathTo(path);
          lastPathSet = +new Date();
        }
      }

      await sleep(100);
    }
  },

  isCriticalHp(criticalHpPercent?: number) {
    return !criticalHpPercent
      ? false
      : player.getHealthPercent() <= criticalHpPercent;
  },

  async eatFood() {
    Player.eat_food();
    await sleep(500);
  },

  getMaxHp: () => skills[0].health.level,
  getCurrentHp: () => skills[0].health.current,
  getHealthPercent: () =>
    Math.floor((player.getCurrentHp() / player.getMaxHp()) * 100),
  getQuiverAmmo: () => players[0].params.archery.count,
  isQuiverFull: () => player.getQuiverAmmo() >= players[0].params.archery.max,

  fillQuiver: async () => {
    const arrowId = players[0].params.archery.id;
    const arrowUses = item_base[arrowId].params.archery_uses;
    const arrowAmount = player.inventory.getItemCountById(arrowId);
    const needToFill =
      players[0].params.archery.max - players[0].params.archery.count;

    if (needToFill <= 0) {
      console.log('no need to fill');
      return;
    }

    const arrowsRequired = Math.ceil(needToFill / arrowUses);
    const arrowsToUseCount =
      arrowsRequired > arrowAmount ? arrowAmount : arrowsRequired;
    const targetArrowCount =
      players[0].params.archery.count + arrowsToUseCount * arrowUses;

    for (let i = 0; i < arrowsToUseCount; i++) {
      Socket.send('equip', { data: { id: arrowId } });
      await sleep(250);
    }

    await waitUntil(() => players[0].params.archery.count === targetArrowCount);
  },

  async useSkill(i: number, j: number, loadPet = false) {
    const obj = world.getObjectAt(i, j);

    if (!obj) {
      return;
    }

    if (!nearEachOther(obj, players[0])) {
      const walkable = world.getNearestWalkablePosition(obj);
      await player.moveTo(walkable.i, walkable.j, true);
    }

    selected_object = obj;
    Player.auto_action(obj);

    await waitUntil(() => typeof timer_holder.auto_action === 'undefined');

    if (loadPet) {
      await player.pet.load();
      await player.useSkill(i, j);
    }
  },

  async forge(itemName: string, anvilI: number, anvilJ: number) {
    const obj = world.getObjectAt(anvilI, anvilJ);
    const itemId = itemIdFromName(itemName);

    if (!obj || !itemId) {
      return;
    }

    const formula = (() => {
      for (const f of Object.values(FORGE_FORMULAS)) {
        if (f.item_id === itemId) {
          return f;
        }
      }

      return undefined;
    })();

    if (!formula) {
      return;
    }

    Forge.active_formula = Number(formula.id);
    Forge.anvil_id = 7805;
    Forge.forging_open();
    await waitUntil(() => !!document.querySelector('#forging-progress-span'));
    Forge.make_all();

    const getMaterialCount = () =>
      player.inventory.getItemCountById(
        Number(Object.keys(formula.materials)[0])
      );

    const materialCount = getMaterialCount();
    const targetInvCount =
      materialCount -
      formula.material_count *
        Math.floor(materialCount / formula.material_count);

    await waitUntil(() => getMaterialCount() === targetInvCount);
  },
};
