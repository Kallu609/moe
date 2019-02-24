export interface IPosition {
  i: number;
  j: number;
}

export interface IObject {
  id: number;
  b_i: number;
  b_t: string;
  i: number;
  j: number;
  map: number;
  params: {
    desc: string;
  };
  name: string;
  img: {
    sheet: string;
    x: number;
    y: number;
  };
  blocking: boolean;
  type: number;
  activities: string[];
  temp: any;
}

export interface IMapJsonItem {
  b_t: string;
  b_i: number;
  id?: number;
  params?: {
    to_map?: number;
    to_i: number;
    to_j: number;
    requires_one_from?: number[];
  };
}

// NPC
export interface INpc {
  id: number;
  b_i: number;
  b_t: string;
  i: number;
  j: number;
  params: {
    health: number;
    radius: number;
    move_radius: number;
    aggressive: boolean;
    speed: number;
    drops: Array<{
      id: number;
      chance: number;
    }>;
    combat_level: number;
  };
  name: string;
  img: {
    hash: string;
  };
  type: number;
  activities: string[];
  temp: {
    health: number;
    busy: boolean;
    magics: Array<{
      id: number;
    }>;
    magic: number;
    total_defense: number;
    total_strength: number;
    total_accuracy: number;
  };
  fn: any;
  blocking: boolean;
}

export type IItemBase = IItemBaseItem[];
export interface IItemBaseItem {
  id: number;
  b_i: number;
  b_t: string;
  i: number;
  j: number;
  params: {
    wearable: boolean;
    slot: number;
    min_forging: number;
    price: number;
    heal: number;
  };
  name: string;
  img: {
    sheet: string;
    x: number;
    y: number;
  };
  type: number;
  activities: any[];
  temp: any;
  fn: any;
  blocking: boolean;
}

export interface IResourceList {
  fishes: number[];
  logs: number[];
  ores: number[];
}

export interface IPlayers {
  [key: string]: IPlayer;
}

export interface IPlayer {
  name: string;
  b_i: number;
  b_t: string;
  permissions: number;
  params: IPlayerParams;
  i: number;
  j: number;
  temp: IPlayerTemp;
  path: IPosition[];
  pet: {
    id: number;
    enabled: boolean;
    chest: number[];
    xp: number;
  };
  map: number;
  quests: {
    [key: string]: {
      finished: boolean;
    };
  };
  sq: {
    id: number;
    qp: number;
    refresh: number;
  };
  id: string;
  l: boolean;
  me: boolean;
  mx: number;
  my: number;
}

export interface IPlayerParams {
  speed: number;
  health: number;
  penalty: number;
  chest_pages: number;
  market_offers: number;
  head: number;
  facial_hair: number;
  body: number;
  pants: number;
  cape: number;
  left_hand: number;
  right_hand: number;
  shield: number;
  helmet: number;
  boots: number;
  weapon: number;
  hash: string;
  hash_o: any[];
  magic_slots: number;
  magics: Array<{
    id: number;
    count: number;
    ready: boolean;
    i: number;
  }>;
  cooldown: number;
  arrow_cooldown: number;
  enough_points: boolean;
  d_head: number;
  d_facial_hair: number;
  d_body: number;
  d_pants: number;
  combat_level: number;
  pvp: boolean;
  att_anim: number;
  played: number;
  today: number;
  archery: {
    quiver: boolean;
    bow: boolean;
  };
  island: boolean;
}

export interface IPlayerTemp {
  animate_until: number;
  to: IPosition;
  dest: IPosition;
  archery: number;
  aim: number;
  power: number;
  magic: number;
  armor: number;
  busy: boolean;
  health: number;
  target_id: number;
  total_defense: number;
  total_strength: number;
  total_accuracy: number;
  total_archery: number;
  inventory: Array<{
    id: number;
    selected: boolean;
  }>;
  combat_style: string;
  fight_id: number;
  coins: number;
  healthbar: boolean;
  active_offers: number;
  chest_size: number;
  duel_with: string;
  duel_id: number;
  last_map: number;
  run: boolean;
  quest_cooldown: number;
  quest_diff: number;
  guild: boolean;
  consecutive_logins: number;
  consecutive_login: number;
  minigame: string;
  allow_spectators: boolean;
  idle_time: number;
  cathedral_level: number;
  cathedral_time: number;
  tower_nature_time: number;
  tower_ice_time: number;
  tower_fire_time: number;
  premium_until: number;
  poseiden_until: number;
  water: number;
  block_multicombat: boolean;
  achievement_points_used: number;
  review: boolean;
  island: boolean;
  nature_time: number;
  total_magic_block: number;
  address: string;
  penalty: boolean;
  created_at: number;
  country: string;
  magic_block: number;
  last_captcha: number;
  melee_block: number;
  archery_block: number;
  pvp_magic_block: number;
  pvp_melee_block: number;
  pvp_archery_block: number;
}

export interface ISkills {
  [skillName: string]: {
    xp: number;
    level: number;
    current: number;
    multiplier: number;
  };
}

export interface IChestItem {
  id: number | string;
  count: number;
}
