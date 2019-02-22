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
  path: any[];
  pet: IPlayerPet;
  map: number;
  quests: IPlayerQuests;
  sq: ISq;
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
  magics: IMagic[];
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
  archery: IArchery;
  island: boolean;
}

export interface IArchery {
  quiver: boolean;
  bow: boolean;
}

export interface IMagic {
  id: number;
  count: number;
  ready: boolean;
  i: number;
}

export interface IPlayerPet {
  id: number;
  enabled: boolean;
  chest: number[];
  xp: number;
}

export interface IPlayerQuests {
  [key: string]: IQuest;
}

export interface IQuest {
  finished: boolean;
}

export interface ISq {
  id: number;
  qp: number;
  refresh: number;
}

export interface IPlayerTemp {
  animate_until: number;
  to: IDest;
  dest: IDest;
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
  inventory: IInventory[];
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

export interface IDest {
  i: number;
  j: number;
}

export interface IInventory {
  id: number | string;
  selected: boolean;
}

export interface IImg {
  sheet: string;
  x: number;
  y: number;
}
