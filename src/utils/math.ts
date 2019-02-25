import { IPosition } from '../types/game';

export function sortByDistance(
  playerPos: IPosition,
  arrayOfPositions: IPosition[]
) {
  const distanceArray = arrayOfPositions.map(x => {
    return {
      distance: Infinity,
      pos: x,
    };
  });

  distanceArray.sort((npc1, npc2) => {
    npc1.distance = distance(playerPos.i, playerPos.j, npc1.pos.i, npc1.pos.j);
    npc2.distance = distance(playerPos.i, playerPos.j, npc2.pos.i, npc2.pos.j);

    return npc1.distance - npc2.distance;
  });

  return distanceArray.map(x => x.pos);
}
