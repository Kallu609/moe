import Draggable from 'draggable';
import * as _ from 'lodash';

import { world } from '../lib/world';
import { ArcheryScript } from '../scripts/archer';
import { FighterScript } from '../scripts/fighter';
import { MiningGuildScript } from '../scripts/miningGuildMining';
// import { DorpatMiningScript } from '../scripts/dorpatMining';
import { ScriptBase } from '../scripts/scriptBase';
import { TesterScript } from '../scripts/tester';
import { IPosition } from '../types/game';
import { waitUntil } from '../utils/waitUntil';

const $ = document.querySelector.bind(document);
const $all = document.querySelectorAll.bind(document);

export class Panel {
  private URL_BASE = 'http://localhost:8080/';
  private currentScript: ScriptBase;

  constructor() {
    this.init();
  }

  async init() {
    await this.addStyle();
    await this.addHtml();
    await this.addScriptButtons();

    // tslint:disable-next-line:no-unused-expression
    new Draggable($('.bot-panel'));

    this.eventHandlers();
  }

  async addScriptButtons() {
    this.addScriptButton(new TesterScript('Tester'));
    this.addScriptButton(
      new FighterScript('Fighter', {
        npcName: 'snow gungan priest',
        food: 'cooked cowfish',
        chest: {
          pos: { i: 63, j: 39 },
          walkTo: { i: 63, j: 38 },
        },
      })
    );
    this.addScriptButton(
      new ArcheryScript('Archer', {
        npcName: 'Dragonfly',
        chestPos: { i: 83, j: 37 },
        arrowName: 'bronze cactus arrow',
      })
    );
    this.addScriptButton(new MiningGuildScript('Miner'));
  }

  eventHandlers() {
    const scriptStateEl = $('.bot-panel #script-state') as HTMLDivElement;
    const mouseCoordsEl = $('.bot-panel #mouse-coords') as HTMLDivElement;
    const underMouseEl = $('.bot-panel #under-mouse') as HTMLDivElement;
    const currentMapEl = $('.bot-panel #current-map') as HTMLDivElement;
    const playerPathEl = $('.bot-panel #player-path') as HTMLDivElement;

    // Mouse

    let mousePos: IPosition;

    document.body.addEventListener('keydown', e => {
      if (e.key === 'Dead') {
        if (mousePos.i && mousePos.j) {
          const obj = world.getObjectAt(mousePos.i, mousePos.j);
          console.log(obj);
        }
      } else if (e.key === '+') {
        console.log(world.getClosestNpc('green wizard'));
      }
    });

    const onMouseMove = _.throttle(e => {
      mousePos = translateMousePosition(e.clientX, e.clientY);
      if (!mousePos || !mousePos.i || !mousePos.j) {
        return;
      }

      mouseCoordsEl.innerHTML = mousePos
        ? `i: ${mousePos.i}, j: ${mousePos.j}`
        : '-';

      const obj = world.getObjectAt(mousePos.i, mousePos.j);
      underMouseEl.innerHTML = obj ? `${obj.name} (id: ${obj.b_i})` : '-';
    }, 100);

    // Player path and map

    setInterval(() => {
      scriptStateEl.textContent = this.currentScript
        ? this.currentScript.currentAction
        : '-';
      currentMapEl.textContent = `${current_map}: ${map_names[current_map]}`;
      playerPathEl.innerHTML = players[0]
        ? players[0].path.map(pos => `i: ${pos.i}, j: ${pos.j}`).join('<br>')
        : '';
    }, 100);

    document.body.addEventListener('mousemove', onMouseMove);
  }

  async addScriptButton(script: ScriptBase) {
    const scriptsEl = $('.bot-panel .scripts') as HTMLDivElement;
    const scriptBtn = document.createElement('button');

    const runningText = `Stop ${script.name}`;
    const stoppedText = `Run ${script.name}`;
    const stoppingText = `Stopping...`;

    scriptBtn.classList.add('script-button');
    scriptBtn.dataset.name = script.name;
    scriptBtn.textContent = stoppedText;

    scriptBtn.onclick = async () => {
      const otherScriptBtns = Array.from(
        $all(`.script-button:not([data-name="${script.name}"])`)
      ) as HTMLButtonElement[];

      if (!script.running) {
        this.currentScript = script;

        for (const other of otherScriptBtns) {
          other.disabled = true;
        }

        script.start();
        scriptBtn.textContent = runningText;
        return;
      }

      script.stop();
      scriptBtn.disabled = true;
      scriptBtn.textContent = stoppingText;

      await waitUntil(() => !script.running);
      delete this.currentScript;

      for (const other of otherScriptBtns) {
        other.disabled = false;
      }

      scriptBtn.disabled = false;
      scriptBtn.textContent = stoppedText;
    };

    scriptsEl.appendChild(scriptBtn);
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
