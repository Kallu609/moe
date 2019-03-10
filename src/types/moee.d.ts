import {
    IArcheryCollision, ICanPerformSkill, IChestItem, IClosestWalkablePosition,
    IForgeFormulas as IForgeFormula, IItemBase, IMapJsonItem, INodeGraphs, INpc, IObject,
    IObjectType, IPlayer, IPlayers, IPosition, IResourceList, IShopSlot, ISkills, ISortClosestTo
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
  const OBJECT_TYPE: IObjectType;

  const DEFAULT_FUNCTIONS: {
    access(object: IObject, player: IPlayer): void;
    mine(object: IObject, player: IPlayer): void;
  };
  const FORGE_FORMULAS: IForgeFormula[];

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
  let addChatText: (
    message: string,
    user?: string,
    color?: string,
    type?: string
  ) => void;
  const closeAllActiveWindows: () => void;
  const do_login: (username: string, password: string) => void;
  const timestamp: () => number;
  const translateMousePosition: (x: number, y: number) => IPosition;
  const obj_g: (mapIndice: IMapJsonItem) => IObject | false;
  const distance: (i1: number, j1: number, i2: number, j2: number) => number;

  const Mods: {
    loadedMods: string[];
    Newmap: {
      MouseTranslate: (i: number, j: number) => IPosition;
    };
  };

  const Player: {
    auto_action(object: IObject): void;
    eat_food(): void;
    update_combat_attributes(player: IPlayer): void;
    client_logout(): void;
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

  const Forge: {
    active_formula: number;
    anvil_id: false | number;
    make_in_progress: boolean;
    continous: boolean;
    continous_make_enabled: boolean;
    make_all(): void;
    forging_open(): void;
  };

  const Archery: {
    client_use(player: IPlayer, target: IObject, d?: any): void;
    bresenham_collision(
      pos1: IPosition,
      pos2: IPosition,
      map: number
    ): IArcheryCollision;
  };

  const Client: {
    monster_spawn(a: any): void;
  };

  const Monster: {
    monster_cleanup_by_id(a: any): void;
    hide(a: any): void;
  };

  const Editor: {
    toggle_minimap(): void;
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

  const socket: any;
  const Socket: {
    send(name: string, value: any): void;
  };

  /*
    Pathfinder stuff
  */
  const sortArrayOfObjectsByFieldValueAsc: (arr: any[], key: string) => any;
  let loadMap: (a: any, b: any, d: any) => any;
  const minimap: boolean;
  const map_size_x: number;
  const map_size_y: number;
  const BinaryHeap: any;
  const GraphNodeType: {
    OPEN: 1;
    WALL: 0;
  };
  let node_graphs: INodeGraphs;
  let d: any;
  let h: any;

  const refreshHUD: () => void;
}
