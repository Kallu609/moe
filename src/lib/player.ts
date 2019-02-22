import { IPosition } from '../types/world';
import { log } from '../utils/logger';

export function pathTo(x: number, y: number) {
  const path = findPathFromTo(players[0], { i: x, j: y }, players[0]);
  return path;
}

export function moveTo(pos: IPosition) {
  if (!players[0]) {
    log(`Can't move to ${JSON.stringify(pos)}. Can't find player`);
    return;
  }

  players[0].path = pathTo(pos.i, pos.j);
}
