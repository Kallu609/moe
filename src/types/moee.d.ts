import {
    IArcheryCollision, ICanPerformSkill, IChestItem, IClosestWalkablePosition, IItemBase,
    IMapJsonItem, INpc, IObject, IPlayer, IPlayers, IPosition, IResourceList, IShopSlot, ISkills,
    ISortClosestTo
} from './game';

declare global {
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
  const npc_base: INpc[];
  const objects_data: IObject[];
  const chest_npc: IObject;
  const on_map: IMapJsonItem[][][];
  const node_graphs: any;
  const pets: any;
  const inAFight: boolean;
  const skills: ISkills[];
  const selected_chest: number | string;
  const chest_page: number;
  const chest_content: IChestItem[];
  const lastRunAwayAttempt: number;
  const shop_content: IShopSlot[];
  const shop_opened: boolean;
  let shop_npc: IObject;
  let captcha: boolean;
  let map_increase: number;
  let touch_hold: number;
  let touch_hold_i: number;
  let touch_hold_j: number;
  let selected_object: IObject;

  const BASE_TYPE: any;
  const DEFAULT_FUNCTIONS: {
    access(object: IObject, player: IPlayer): void;
    mine(object: IObject, player: IPlayer): void;
  };

  const movementInProgress: (player: IPlayer) => boolean;
  const nearEachOther: (object: IObject, player: IPlayer) => boolean;
  const map_walkable: (map: number, i: number, j: number) => boolean;

  const sortClosestTo: (
    position: IPosition,
    arrayOfPositions: IPosition[]
  ) => ISortClosestTo;

  const getClosestWalkablePosition: (
    map: number,
    i: number,
    j: number
  ) => IClosestWalkablePosition;

  const findPathFromTo: (
    player: IPlayer,
    pos: IPosition,
    playerMapRef: IPlayer // ???
  ) => IPosition[];

  const needsProximity: (
    player: IPlayer,
    obj: IObject,
    minDistance: number,
    moveTo?: 0 | 1 | boolean,
    idk?: number
  ) => boolean;

  const createElem: (
    tagName: string,
    target: Node,
    options: {
      innerHTML: string;
    }
  ) => void;

  let pageHidden: () => void;
  const closeAllActiveWindows: () => void;
  const do_login: (username: string, password: string) => void;
  const timestamp: () => number;
  const translateMousePosition: (x: number, y: number) => IPosition;
  const obj_g: (mapIndice: IMapJsonItem) => IObject | false;
  const distance: (i1: number, j1: number, i2: number, j2: number) => number;

  const Mods: {
    loadedMods: string[];
  };

  const Player: {
    auto_action(object: IObject): void;
    eat_food(): void;
    update_combat_attributes(player: IPlayer): void;
  };

  const BigMenu: {
    init_inventory(): void;
    show_quiver(): void;
  };

  const Inventory: {
    resources_list: IResourceList;
    is_full(player: IPlayer): boolean;
    get_item_count(player: IPlayer, itemId: number | undefined): number;
    get_item_counts(player: IPlayer): number;
    equip(player: IPlayer, itemId: number): boolean;
    unequip(player: IPlayer, itemId: number): boolean;
  };

  const Chest: {
    is_open(): boolean;
    player_find_item_index(startIndex: number, itemId: number): number;
  };

  const LootCrate: {
    remove(i: number, j: number, map: number): void;
  };

  const Archery: {
    client_use(player: IPlayer, target: IObject, d?: any): void;
    bresenham_collision(
      pos1: IPosition,
      pos2: IPosition,
      map: number
    ): IArcheryCollision;
  };

  const Shop: {
    activate_update(): void;
  };

  const Skills: {
    can_perform(player: IPlayer, targetId: number): ICanPerformSkill;
  };

  const timer_holder: {
    [key: string]: number;
  };

  const Timers: {
    running(key: string): boolean;
    set(key: string, fn?: () => any, interval?: number): void;
  };

  const penalty_bonus: () => void;
  const CaptchaControl: {
    render(): void;
  };

  const Socket: {
    send(name: string, value: any): void;
  };
}
