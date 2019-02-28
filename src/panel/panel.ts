import * as _ from 'lodash';

import { world } from '../lib/world';
import { ArcheryScript } from '../scripts/archer';
import { BottleFillerScript } from '../scripts/bottleFiller';
import { DorpatMiningScript } from '../scripts/dorpatMining';
import { FighterScript } from '../scripts/fighter';
import { MiningGuildScript } from '../scripts/miningGuildMining';
import { SandSmelterScript } from '../scripts/sandSmelter';
import { SapphireDragonFighterScript } from '../scripts/sapphireDragonFighter';
import { ScriptBase } from '../scripts/shared/scriptBase';
import { ShopBuyerScript } from '../scripts/shopBuyer';
import { TesterScript } from '../scripts/tester';
import { IPosition } from '../types/game';
import { waitUntil } from '../utils/waitUntil';

const $ = document.querySelector.bind(document);
let $p: any;

export class Panel {
  private URL_BASE = 'http://localhost:8080/';
  private scripts: {
    [name: string]: ScriptBase;
  } = {};
  private currentScript: ScriptBase;
  private mouseTile: IPosition;

  constructor() {
    this.init();
  }

  async init() {
    await this.addStyle();
    await this.addHtml();

    $p = $('.bot-panel').querySelector.bind($('.bot-panel'));

    this.addScripts();
    this.eventHandlers();
  }

  addScripts() {
    this.addScriptToList(
      new ShopBuyerScript('Shop buyer', {
        itemName: 'fir log',
      })
    );
    this.addScriptToList(new SandSmelterScript('Sand smelter'));
    this.addScriptToList(new BottleFillerScript('Bottle filler rakblood'));
    this.addScriptToList(new MiningGuildScript('Mining guild miner'));
    this.addScriptToList(new DorpatMiningScript('Dorpat miner'));

    this.addScriptToList(
      new FighterScript('Fighter', {
        npcName: 'minotaur',
        foodName: 'cooked cowfish',
        chestPos: { i: 22, j: 17 },
        criticalHpPercent: 40,
      })
    );

    this.addScriptToList(
      new SapphireDragonFighterScript('Sapphire dragon fighter', {
        npcName: 'sapphire dragon',
        foodName: 'cooked cowfish',
        chestPos: { i: 22, j: 17 },
        criticalHpPercent: 40,
      })
    );

    this.addScriptToList(
      new ArcheryScript('Archer', {
        npcName: 'Dragonfly',
        chestPos: { i: 83, j: 37 },
        arrowName: 'bronze cactus arrow',
      })
    );

    this.addScriptToList(new TesterScript('Tester'));
  }

  eventHandlers = () => {
    const detailsEl = $p('details') as HTMLElement;
    const summaryEl = $p('summary') as HTMLElement;
    const scriptListEl = $p('#script-list') as HTMLSelectElement;
    const startScriptEl = $p('#start-script') as HTMLButtonElement;
    const stopScriptEl = $p('#stop-script') as HTMLButtonElement;

    scriptListEl.onchange = () => {
      this.currentScript = this.scripts[scriptListEl.value];
      startScriptEl.disabled = false;
    };

    startScriptEl.onclick = () => {
      scriptListEl.disabled = true;
      startScriptEl.disabled = true;
      stopScriptEl.disabled = false;
      this.currentScript.start();
    };

    stopScriptEl.onclick = async () => {
      stopScriptEl.disabled = true;
      this.currentScript.stop();
      await waitUntil(() => !this.currentScript.running);
      scriptListEl.disabled = false;
      startScriptEl.disabled = false;
    };

    summaryEl.onclick = () => {
      summaryEl.textContent = detailsEl.hasAttribute('open')
        ? 'Show details'
        : 'Hide details';
    };

    setInterval(() => {
      this.updateVariables();
    }, 100);

    document.body.addEventListener('keydown', this.onKeyDown);
    document.body.addEventListener(
      'mousemove',
      _.throttle(this.onMouseMove, 100)
    );
  };

  updateVariables() {
    const currentMapEl = $p('#current-map') as HTMLDivElement;
    const playerPathEl = $p('#player-path') as HTMLDivElement;
    const scriptStateEl = $p('#script-state') as HTMLDivElement;

    scriptStateEl.textContent = (() => {
      if (this.currentScript && this.currentScript.running) {
        if (this.currentScript.stopFlag) {
          return 'Stopping...';
        }

        if (this.currentScript.currentAction) {
          return this.currentScript.currentAction;
        }
      }

      return '-';
    })();

    currentMapEl.textContent = `${current_map}: ${map_names[current_map]}`;

    const p = players[0];
    playerPathEl.innerHTML =
      p && p.path.length
        ? `[${p.path.length}] i: ${p.path[0].i}, j: ${p.path[0].j}`
        : '-';
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Dead' && this.mouseTile.i) {
      const obj = world.getObjectAt(this.mouseTile.i, this.mouseTile.j);
      console.log(obj);
    }
  }

  onMouseMove(e: MouseEvent) {
    const mouseCoordsEl = $p('#mouse-coords') as HTMLDivElement;
    const underMouseEl = $p('#under-mouse') as HTMLDivElement;
    const tile = translateMousePosition(e.clientX, e.clientY);

    this.mouseTile = tile;

    if (!tile || !tile.i || !tile.j) {
      return;
    }

    const obj = world.getObjectAt(tile.i, tile.j);

    mouseCoordsEl.innerHTML = tile ? `i: ${tile.i}, j: ${tile.j}` : '-';
    underMouseEl.innerHTML = obj ? obj.name : '-';
  }

  async addScriptToList(script: ScriptBase) {
    const scriptListEl = $p('#script-list') as HTMLSelectElement;
    const startScriptEl = $p('#start-script') as HTMLButtonElement;
    const stopScriptEl = $p('#stop-script') as HTMLButtonElement;
    const optionEl = document.createElement('option');

    optionEl.textContent = script.name;
    optionEl.value = script.name;

    scriptListEl.appendChild(optionEl);

    script.setStopAction(() => {
      scriptListEl.disabled = false;
      startScriptEl.disabled = false;
      stopScriptEl.disabled = true;
    });

    this.scripts[script.name] = script;
  }

  async addStyle() {
    const req = await fetch(this.URL_BASE + 'panel/style.css');
    const cssText = await req.text();
    const node = document.createElement('style');
    node.innerHTML = cssText;
    document.head.appendChild(node);
  }

  async addHtml() {
    const req = await fetch(this.URL_BASE + 'panel/index.html');
    const text = await req.text();

    createElem('div', document.body, {
      innerHTML: text,
    });
  }
}
