import { IPosition } from '../types/game';

export function distance(pos1: IPosition, pos2: IPosition) {
  return Math.abs(
    Math.sqrt(
      (pos1.i - pos2.i) * (pos1.i - pos2.i) +
        (pos1.j - pos2.j) * (pos1.j - pos2.j)
    )
  );
}

export function sortByDistance(pos: IPosition, arrayOfPositions: IPosition[]) {
  const distanceArray = arrayOfPositions.map(x => {
    return {
      distance: Infinity,
      pos: x,
    };
  });

  distanceArray.sort((a, b) => {
    a.distance = distance(pos, a.pos);
    b.distance = distance(pos, b.pos);

    return a.distance - b.distance;
  });

  return distanceArray.map(x => x.pos);
}
