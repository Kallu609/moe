import { ArcheryScript } from '../scripts/archer';
import { BottleFillerScript } from '../scripts/bottleFiller';
import { DorpatMiningScript } from '../scripts/dorpatMining';
import { DungeonOneKillerScript } from '../scripts/dungeonOneKiller';
import { FighterScript } from '../scripts/fighter';
import { FletchGuildWcScript } from '../scripts/fletchGuildWc';
import { ForgerScript } from '../scripts/forger';
import { MiningGuildScript } from '../scripts/miningGuildMining';
import { SandSmelterScript } from '../scripts/sandSmelter';
import { ShopBuyerScript } from '../scripts/shopBuyer';
import { TesterScript } from '../scripts/tester';
import { WoodcutterScript } from '../scripts/woodcutter';

export const scriptList = [
  new ShopBuyerScript('Shop buyer', {
    itemName: 'fir log',
  }),
  new SandSmelterScript('Sand smelter'),
  new BottleFillerScript('Bottle filler rakblood'),
  new MiningGuildScript('Mining guild miner'),
  new DorpatMiningScript('Dorpat miner'),
  new WoodcutterScript('Maple WC cesis', {
    treePos: [70, 18],
    nearChestPos: [14, 33],
  }),
  new FletchGuildWcScript('Fletch guild WC', {
    treePos: [43, 83], // Magic oak
  }),
  new ForgerScript('Forger', {
    materialName: 'oak log',
    produceName: 'oak stick',
  }),
  new FighterScript('Fighter', {
    npcName: 'minotaur',
    foodName: 'cooked cowfish',
    chestPos: [22, 17],
    criticalHpPercent: 40,
  }),
  new DungeonOneKillerScript('Ruby dragon fighter', {
    npcNames: ['King Ruby Dragon', 'Adult ruby dragon'],
    foodName: 'cooked cowfish',
    chestPos: [22, 17],
    criticalHpPercent: 70,
  }),
  new ArcheryScript('Archer', {
    npcName: 'Dragonfly',
    chestPos: [83, 37],
    arrowName: 'bronze cactus arrow',
  }),

  new TesterScript('Tester'),
];
