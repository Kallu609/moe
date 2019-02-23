import * as _ from 'lodash';

import { minerScript } from '../scripts/miner';
import { testerScript } from '../scripts/tester';

export class Panel {
  private URL_BASE = 'http://localhost:8080/';

  constructor() {
    this.init();
  }

  async init() {
    await this.addStyle();
    await this.addHtml();
    this.eventHandlers();
  }

  eventHandlers() {
    const panelEl = document.querySelector('.bot-panel') as Element;
    const $panel = panelEl.querySelector.bind(panelEl);
    const el = {
      scriptTestBtn: $panel('#script-test') as HTMLButtonElement,
      scriptMinerBtn: $panel('#script-miner') as HTMLButtonElement,

      mouseCoords: $panel('#mouse-coords') as HTMLDivElement,
      currentMap: $panel('#current-map') as HTMLDivElement,
      playerPath: $panel('#player-path') as HTMLDivElement,
    };

    // Scripts

    el.scriptTestBtn.onclick = () => {
      testerScript.run();
    };

    el.scriptMinerBtn.onclick = () => {
      minerScript.run();
    };

    // Mouse coords

    const onMouseMove = _.throttle(e => {
      const mousePos = translateMousePosition(e.clientX, e.clientY);
      el.mouseCoords.innerHTML = `{x: ${mousePos.i}, y: ${mousePos.j}}`;
    }, 100);

    setInterval(() => {
      el.currentMap.textContent = current_map.toString();
      el.playerPath.textContent = players[0]
        ? `${JSON.stringify(players[0].path)}`
        : '[]';
    }, 100);

    document.body.addEventListener('mousemove', onMouseMove);
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
