import * as _ from 'lodash';

import { INodeGraphs, IPosition } from '../types/game';
import { sleep } from '../utils/waitUntil';
import { player } from './player';
import { world } from './world';

export const movementState = {
  done: 'done',
  monsterInWay: 'monster in way',
  runAway: 'fighting',
  failed: 'failed',
};

export async function moveToWithForce(i: number, j: number): Promise<any> {
  const oldMapIncrease = map_increase;
  map_increase = 200;
  const path = customPathTo(i, j, 'monsterless');

  if (!path.length) {
    map_increase = oldMapIncrease;
    return [movementState.done];
  }

  players[0].path = path;
  map_increase = oldMapIncrease;

  while (!endOfPath(i, j)) {
    await sleep(500);

    if (nextInPathIsMonster(i, j)) {
      const npc = world.getObjectAtPos(getNextInPath(i, j));
      const ret = [movementState.monsterInWay, npc];
      players[0].path = [];
      return ret;
    } else if (inAFight) {
      players[0].path = [];
      return [movementState.runAway];
    } else if (!movementInProgress(players[0])) {
      players[0].path = [];
      return moveToWithForce(i, j);
    }
  }

  return [movementState.done];
}

function endOfPath(i: number, j: number) {
  return !players[0].path.length && player.atPosition(i, j);
}

function getNextInPath(i: number, j: number) {
  const oldMapIncrease = map_increase;
  map_increase = 200;
  const path = customPathTo(i, j, 'monsterless');
  map_increase = oldMapIncrease;

  return path[path.length - 1];
}

function nextInPathIsMonster(i: number, j: number) {
  const nextTile = getNextInPath(i, j);

  if (!nextTile) {
    return false;
  }

  const obj = world.getObjectAt(nextTile.i, nextTile.j);

  if (!obj) {
    return false;
  }

  return obj.activities[0] === 'Attack';
}

/*



















*/

// Pathfinder stuff

// tslint:disable:no-var-keyword
// tslint:disable:prefer-const
// tslint:disable:no-unused-expression
// tslint:disable:ban-comma-operator

interface ICustomGraphs {
  [key: string]: INodeGraphs;
}

export const customGraphs: ICustomGraphs = {};
setupProxies();

function setupProxies() {
  const fnLoadMap = loadMap;
  const loadMapProxy = new Proxy(fnLoadMap, {
    apply: (fn, ctx, args) => {
      fn.apply(ctx, args);
      loadCustomNodeGraphs(args[0]);
      return;
    },
  });
  loadMap = loadMapProxy;

  /*

  Client.monster_spawn = newWallProxy(Client.monster_spawn);
  // Monster.monster_cleanup_by_id = newOpenProxy(Monster.monster_cleanup_by_id);
  Monster.hide = newOpenProxy(Monster.hide);*/
}
/*
function newOpenProxy(fn: (...args: any) => any) {
  return newGraphTypeUpdateProxy(fn, GraphNodeType.OPEN);
}

function newWallProxy(fn: (...args: any) => any) {
  return newGraphTypeUpdateProxy(fn, GraphNodeType.WALL);
}

function newGraphTypeUpdateProxy(fn: (...args: any) => any, newType: 0 | 1) {
  const proxy = new Proxy(fn, {
    apply: (func, ctx, args) => {
      console.log(args);

      const obj = (() => {
        if (args[0].target) {
          return args.target;
        }

        if (args[0].map !== undefined) {
          return args[0];
        }
      })();

      if (!obj) {
        debugger;
      }
      console.log(obj);

      const { map, i, j } = obj;
      console.log(`(${i}, ${j}) ${newType}`);

      for (const graphKey of Object.keys(customGraphs)) {
        customGraphs[graphKey][map].nodes[i][j].type = newType;
      }

      return func.apply(ctx, args);
    },
  });

  return proxy;
}*/

function loadCustomNodeGraphs(map: number) {
  const monsterless = _.cloneDeep(node_graphs);
  const monsterAvoid = _.cloneDeep(node_graphs);

  let monsterCount = 0;

  for (let i = 0; i < on_map[map].length; i++) {
    for (let j = 0; j < on_map[map][0].length; j++) {
      const tile = on_map[map][i][j];

      if (!tile || tile.b_t !== BASE_TYPE.NPC) {
        continue;
      }

      const obj = world.getObjectAt(i, j);

      if (!obj) {
        continue;
      }

      if (
        obj.b_t === BASE_TYPE.NPC &&
        BASE_TYPE[obj.b_t][obj.b_i].type === OBJECT_TYPE.ENEMY
      ) {
        monsterless[map].nodes[i][j].type = GraphNodeType.OPEN;
        monsterAvoid[map].nodes[i + 1][j].type = GraphNodeType.WALL;
        monsterAvoid[map].nodes[i - 1][j].type = GraphNodeType.WALL;
        monsterAvoid[map].nodes[i][j + 1].type = GraphNodeType.WALL;
        monsterAvoid[map].nodes[i][j - 1].type = GraphNodeType.WALL;
        monsterCount++;
      }
    }
  }

  customGraphs.monsterless = monsterless;
  customGraphs.monsterAvoid = monsterAvoid;
  console.log(`Loaded node graphs. (Found ${monsterCount} monsters)`);
}

export function customPathTo(
  i: number,
  j: number,
  graphToUse: 'monsterless' | 'monsterAvoid'
) {
  return customPathToPos({ i, j }, graphToUse);
}

export function customPathToPos(
  pos: IPosition,
  graphToUse: 'monsterless' | 'monsterAvoid'
) {
  const customGraph = customGraphs[graphToUse];
  const oldMapIncrease = map_increase;
  map_increase = 200;

  var tiles = [pos];
  if (0 === customGraph[players[0].map].nodes[pos.i][pos.j].type) {
    tiles = sortClosestTo(players[0], [
      { i: Math.max(pos.i - 1, 0), j: pos.j },
      { i: Math.min(pos.i + 1, map_size_x), j: pos.j },
      { i: pos.i, j: Math.max(pos.j - 1, 0) },
      { i: pos.i, j: Math.min(pos.j + 1, map_size_y) },
    ]);
    for (
      tiles.reverse();
      0 < tiles.length &&
      0 ===
        customGraph[players[0].map].nodes[tiles[tiles.length - 1].i][
          tiles[tiles.length - 1].j
        ].type;

    ) {
      tiles.pop();
    }
    if (0 === tiles.length) {
      map_increase = oldMapIncrease;
      return [];
    }
  }
  var g = [];

  for (var b = 0; b < tiles.length; b++) {
    const h = aplusplusstar.search(
      customGraph[players[0].map].nodes,
      customGraph[players[0].map].nodes[players[0].i][players[0].j],
      customGraph[players[0].map].nodes[tiles[b].i][tiles[b].j]
    );
    0 !== h.length && g.push(h);
  }
  g = sortArrayOfObjectsByFieldValueAsc(g, 'length');
  if (g[0] && 0 !== g[0].length) {
    h = g[0];
    const positions = [];
    for (b = h.length - 1; 0 <= b; b--) {
      positions.push({ i: h[b].x, j: h[b].y });
    }
    map_increase = oldMapIncrease;
    return positions as IPosition[];
  }
  map_increase = oldMapIncrease;
  return [];
}

const aplusplusstar = {
  init: (grid: any, start: any, dist: any) => {
    for (
      var x = Math.max(0, start.x - dist),
        xl = Math.min(grid.length, start.x + dist);
      x < xl;
      x++
    ) {
      for (
        var y = Math.max(0, start.y - dist),
          yl = Math.min(grid[0].length, start.y + dist);
        y < yl;
        y++
      ) {
        var node = grid[Math.floor(x)][Math.floor(y)];
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.cost = node.type;
        node.visited = false;
        node.closed = false;
        node.parent = null;
      }
    }
  },
  heap: () => {
    return new BinaryHeap((node: any) => {
      return node.f;
    });
  },
  search: (
    grid: any,
    start: any,
    end: any,
    diagonal?: any,
    heuristic?: any
  ) => {
    const distance = 5 + map_increase / 2;
    aplusplusstar.init(grid, start, distance);
    heuristic = heuristic || aplusplusstar.manhattan;
    diagonal = !!diagonal;

    var openHeap = aplusplusstar.heap();

    openHeap.push(start);

    while (openHeap.size() > 0) {
      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        var curr = currentNode;
        var ret = [];
        while (curr.parent) {
          ret.push(curr);
          curr = curr.parent;
        }
        return ret.reverse();
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
      var neighbors = aplusplusstar.neighbors(
        grid,
        currentNode,
        diagonal,
        start,
        distance
      );

      for (var i = 0, il = neighbors.length; i < il; i++) {
        var neighbor = neighbors[i];

        if (neighbor.closed || neighbor.isWall()) {
          // Not a valid node to process, skip to next neighbor.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        var gScore = currentNode.g + neighbor.cost;
        var beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {
          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor.pos, end.pos);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    // No result was found - empty array signifies failure to find path.
    return [];
  },
  manhattan: (pos0: any, pos1: any) => {
    // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

    var d1 = Math.abs(pos1.x - pos0.x);
    var d2 = Math.abs(pos1.y - pos0.y);
    return d1 + d2;
  },
  neighbors: (
    grid: any,
    node: any,
    diagonals: any,
    start: any,
    distance: any
  ) => {
    var ret = [];
    var x = node.x;
    var y = node.y;

    grid[x - 1] &&
      grid[x - 1][y] &&
      x - 1 > start.x - distance &&
      ret.push(grid[x - 1][y]);

    grid[x + 1] &&
      grid[x + 1][y] &&
      x + 1 < start.x + distance &&
      ret.push(grid[x + 1][y]);

    grid[x] &&
      grid[x][y - 1] &&
      y - 1 > start.y - distance &&
      ret.push(grid[x][y - 1]);

    grid[x] &&
      grid[x][y + 1] &&
      y + 1 < start.y + distance &&
      ret.push(grid[x][y + 1]);

    diagonals &&
      (grid[x - 1] && grid[x - 1][y - 1] && ret.push(grid[x - 1][y - 1]),
      grid[x + 1] && grid[x + 1][y - 1] && ret.push(grid[x + 1][y - 1]),
      grid[x - 1] && grid[x - 1][y + 1] && ret.push(grid[x - 1][y + 1]),
      grid[x + 1] && grid[x + 1][y + 1] && ret.push(grid[x + 1][y + 1]));

    return ret;
  },
};

/*const shittystar = {
  init(a: any, b: any, d: any) {
    for (
      var e = Math.max(0, b.x - d), g = Math.min(a.length, b.x + d);
      e < g;
      e++
    ) {
      for (
        var h = Math.max(0, b.y - d), k = Math.min(a[0].length, b.y + d);
        h < k;
        h++
      ) {
        var m = a[e][h];
        m.f = 0;
        m.g = 0;
        m.h = 0;
        m.cost = m.type;
        m.visited = !1;
        m.closed = !1;
        m.parent = null;
      }
    }
  },

  heap() {
    return new BinaryHeap(function(a: any) {
      return a.f;
    });
  },

  search(a: any, b: any, d: any, e?: any, g?: any) {
    var h = 5 + map_increase / 2;
    shittystar.init(a, b, h + 1);
    g = g || shittystar.manhattan;
    e = !!e;
    var k = shittystar.heap();
    for (k.push(b); 0 < k.size(); ) {
      var m = k.pop();
      if (m === d) {
        a = m;
        for (b = []; a.parent; ) {
          b.push(a), (a = a.parent);
        }
        return b.reverse();
      }
      m.closed = !0;
      for (
        var n = shittystar.neighbors(a, m, e, b, h), l = 0, r = n.length;
        l < r;
        l++
      ) {
        var q = n[l];
        if (!q.closed && !q.isWall()) {
          var v = m.g + q.cost,
            x = q.visited;
          if (!x || v < q.g) {
            (q.visited = !0),
              (q.parent = m),
              (q.h = q.h || g(q.pos, d.pos)),
              (q.g = v),
              (q.f = q.g + q.h),
              x ? k.rescoreElement(q) : k.push(q);
          }
        }
      }
    }
    return [];
  },
  manhattan(a: any, b: any) {
    var d = Math.abs(b.x - a.x),
      e = Math.abs(b.y - a.y);
    return d + e;
  },
  neighbors(a: any, b: any, d: any, e: any, g: any) {
    var h = [],
      k = b.x;
    b = b.y;
    a[k - 1] && a[k - 1][b] && k - 1 > e.x - g && h.push(a[k - 1][b]);
    a[k + 1] && a[k + 1][b] && k + 1 < e.x + g && h.push(a[k + 1][b]);
    a[k] && a[k][b - 1] && b - 1 > e.y - g && h.push(a[k][b - 1]);
    a[k] && a[k][b + 1] && b + 1 < e.y + g && h.push(a[k][b + 1]);
    d &&
      (a[k - 1] && a[k - 1][b - 1] && h.push(a[k - 1][b - 1]),
      a[k + 1] && a[k + 1][b - 1] && h.push(a[k + 1][b - 1]),
      a[k - 1] && a[k - 1][b + 1] && h.push(a[k - 1][b + 1]),
      a[k + 1] && a[k + 1][b + 1] && h.push(a[k + 1][b + 1]));
    return h;
  },
};
*/
