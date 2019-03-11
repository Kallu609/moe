import * as dayjs from 'dayjs';
import * as _ from 'lodash';

import { customPathTo } from '../lib/path';
import { player } from '../lib/player';
import { world } from '../lib/world';
import { ScriptBase } from '../scripts/shared/scriptBase';
import { IPosition } from '../types/game';
import { turnOnSleepMode } from '../utils/socket';
import { waitUntil } from '../utils/waitUntil';
import { hide, show } from './helpers';
import { scriptList } from './scripts';

interface IScripts {
  [name: string]: ScriptBase;
}

const $ = document.querySelector.bind(document);
let $p: any;

export class Panel {
  public socketTrafficOut: boolean = false;
  public socketTrafficIn: boolean = false;
  private URL_BASE = 'http://localhost:8080/';
  private scripts: IScripts = {};
  private currentScript: ScriptBase;

  private showMouseCoords = false;
  private mouseTile: IPosition;
  private mouseCoordsEl: HTMLDivElement;
  private mouseCoordsXEl: HTMLSpanElement;
  private mouseCoordsYEl: HTMLSpanElement;
  private recordingPath = false;
  private recordedPath: Array<Array<number[] | string>> = [];

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
    const scriptListEl = $p('#script-list') as HTMLSelectElement;
    const startScriptEl = $p('#start-script') as HTMLButtonElement;
    const selectedScript = localStorage.getItem('selected_script');
    const sortedScripts = scriptList.sort((a, b) => (a.name > b.name ? 1 : -1));

    sortedScripts.forEach((script, i) => {
      this.addScriptToList(script);

      if (script.name === selectedScript) {
        this.currentScript = script;
        scriptListEl.selectedIndex = i + 1;
        startScriptEl.disabled = false;
      }
    });
  }

  eventHandlers = () => {
    const leftColEl = $p('.col-left') as HTMLDivElement;
    const detailsEl = $p('details') as HTMLElement;
    const summaryEl = $p('summary') as HTMLElement;
    const scriptListEl = $p('#script-list') as HTMLSelectElement;
    const startScriptEl = $p('#start-script') as HTMLButtonElement;
    const stopScriptEl = $p('#stop-script') as HTMLButtonElement;
    const socketTrafficOutEl = $p('#socket-traffic-out') as HTMLInputElement;
    const socketTrafficInEl = $p('#socket-traffic-in') as HTMLInputElement;
    const mouseCoordsCheckbox = $p('#mouse-coords') as HTMLInputElement;
    const mouseCoordsEl = $('.mouse-coords') as HTMLDivElement;
    const recordPathCheckbox = $p('#record-path') as HTMLInputElement;

    scriptListEl.onchange = () => {
      this.currentScript = this.scripts[scriptListEl.value];
      startScriptEl.disabled = false;
      localStorage.setItem('selected_script', scriptListEl.value);
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

    socketTrafficOutEl.onchange = () => {
      this.socketTrafficOut = socketTrafficOutEl.checked;
    };

    socketTrafficInEl.onchange = () => {
      this.socketTrafficIn = socketTrafficInEl.checked;
    };

    // Mouse coords
    this.showMouseCoords =
      !!Number(localStorage.getItem('mouse_coords_enabled')) || false;
    this.showMouseCoords ? show(mouseCoordsEl) : hide(mouseCoordsEl);
    mouseCoordsCheckbox.checked = this.showMouseCoords;

    mouseCoordsCheckbox.onchange = () => {
      const enabled = mouseCoordsCheckbox.checked;
      enabled ? show(mouseCoordsEl) : hide(mouseCoordsEl);
      this.showMouseCoords = enabled;
      localStorage.setItem('mouse_coords_enabled', Number(enabled).toString());
    };

    recordPathCheckbox.onchange = () => {
      this.recordingPath = recordPathCheckbox.checked;

      if (recordPathCheckbox.checked) {
        $('.bot-panel').style.gridTemplateColumns = '200px 300px';
        show(leftColEl);
        this.logClear();
        this.recordedPath = [];
        return;
      }

      $('.bot-panel').style.gridTemplateColumns = '300px';
      hide(leftColEl);
    };

    setInterval(() => {
      this.updateVariables();
    }, 100);

    document.body.addEventListener('mousedown', this.onMouseDown);
    document.body.addEventListener('keydown', this.onKeyDown);
    document.body.addEventListener('mousemove', e => {
      this.mouseCoordsEl = $('.mouse-coords');
      this.mouseCoordsXEl = $('.mouse-coords #x');
      this.mouseCoordsYEl = $('.mouse-coords #y');
      this.onMouseMove(e);
    });
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

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === '+' && this.mouseTile.i) {
      const obj = world.getObjectAt(this.mouseTile.i, this.mouseTile.j);
      console.log(obj);
    }
  };

  onMouseMove = (e: MouseEvent) => {
    const tile = translateMousePosition(e.clientX, e.clientY);
    this.mouseTile = tile;

    if (this.showMouseCoords && tile && tile.i) {
      this.mouseCoordsEl.style.left = e.pageX - 20 + 'px';
      this.mouseCoordsEl.style.top = e.pageY - 30 + 'px';
      this.mouseCoordsXEl.textContent = tile.i.toString();
      this.mouseCoordsYEl.textContent = tile.j.toString();
    }
  };

  addToPath = (step: Array<number[] | string>) => {
    this.recordedPath.push(step);
    this.logClear();
    this.log(
      this.recordedPath
        .map(recordedStep => {
          const [stepName, ...args] = recordedStep;
          return `${stepName}${args.length ? ` [${args.join(',')}]` : ''}`;
        })
        .join('\n')
    );
  };

  onMouseDown = async (e: MouseEvent) => {
    if (!e) {
      return;
    }

    // Middle click
    if (e.button === 1) {
      if (!minimap) {
        const obj = world.getObjectAt(this.mouseTile.i, this.mouseTile.j);

        console.log(obj);

        if (this.recordingPath) {
          if (!obj) {
            return this.addToPath([
              'move',
              [this.mouseTile.i, this.mouseTile.j],
            ]);
          }

          if (world.isEnemy(obj)) {
            return this.addToPath(['attack', [obj.i, obj.j]]);
          }

          if (obj.name === 'Chest') {
            return this.addToPath(['open chest', [obj.i, obj.j]]);
          }

          if (obj.params.to_map !== undefined) {
            return this.addToPath(['teleport', [obj.i, obj.j]]);
          }

          if (obj.params.results !== undefined) {
            return this.addToPath(['use skill', [obj.i, obj.j]]);
          }
        }

        console.log(obj);
        return;
      }

      let { i, j } = Mods.Newmap.MouseTranslate(e.clientX, e.clientY);

      if (!i === undefined || !j === undefined) {
        return;
      }

      i = Math.round(i) - 9;
      j = Math.round(j) + 7;

      const closest = world.getClosestWalkable(i, j, true);

      if (!closest) {
        return;
      }

      const path = customPathTo(closest.i, closest.j, 'monsterAvoid');

      if (path.length) {
        console.log('lets GOO!!!');
        Editor.toggle_minimap();
        player.setPathTo(path);
        refreshHUD();
      }
    }
  };

  async addScriptToList(script: ScriptBase) {
    const scriptListEl = $p('#script-list') as HTMLSelectElement;
    const startScriptEl = $p('#start-script') as HTMLButtonElement;
    const stopScriptEl = $p('#stop-script') as HTMLButtonElement;
    const sleepModeEl = $p('#sleep-mode') as HTMLInputElement;
    const optionEl = document.createElement('option');

    optionEl.textContent = script.name;
    optionEl.value = script.name;

    scriptListEl.appendChild(optionEl);

    script.setStopAction(() => {
      scriptListEl.disabled = false;
      startScriptEl.disabled = false;
      stopScriptEl.disabled = true;

      if (sleepModeEl.checked) {
        turnOnSleepMode();
      }
    });

    this.scripts[script.name] = script;
  }

  async logClear() {
    const logs = $p('#logs') as HTMLTextAreaElement;
    logs.value = '';
  }

  async log(text: string, timestamp?: boolean) {
    const logs = $p('#logs') as HTMLTextAreaElement;
    logs.value +=
      (timestamp ? dayjs().format('[HH:mm:ss] ') : '') + text + '\n';
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
