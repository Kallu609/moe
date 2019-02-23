import { IItemBase } from './items';
import { IMapJsonItem, IObject } from './object';
import { IPlayer, IPlayers } from './players';
import { IPosition } from './world';

declare global {
  const Mods: {
    loadedMods: string[];
  };
  const players: IPlayers;
  const game_timestamp: {
    init?: number;
    onLoad?: number;
    loaded?: number;
    finished?: number;
    connected?: number;
  };
  const current_map: number;
  const map_change_in_progress: boolean;
  const map_names: string[];
  const item_base: IItemBase;
  const objects_data: IObject[];
  const chest_npc: IObject;
  const on_map: IMapJsonItem[][][];
  const node_graphs: any;
  const pets: any;
  let map_increase: number;
  let touch_hold: number;
  let touch_hold_i: number;
  let touch_hold_j: number;

  const DEFAULT_FUNCTIONS: {
    access: (object: IObject, player: IPlayer) => void;
    mine: (object: IObject, player: IPlayer) => void;
  };

  const movementInProgress: (player: IPlayer) => boolean;

  const findPathFromTo: (
    player: IPlayer,
    pos: IPosition,
    playerMapRef: IPlayer // ???
  ) => IPosition[];

  const createElem: (
    tagName: string,
    target: Node,
    options: {
      innerHTML: string;
    }
  ) => void;

  const do_login: (username: string, password: string) => void;
  const translateMousePosition: (x: number, y: number) => IPosition;

  const Inventory: {
    is_full: (player: IPlayer) => boolean;
    get_item_count: (player: IPlayer, itemId: number) => number;
  };

  const Chest: {
    is_open: () => boolean;
    player_find_item_index: (startIndex: number, itemId: number) => number;
  };

  const Socket: {
    send: (name: string, value: any) => void;
  };
}
