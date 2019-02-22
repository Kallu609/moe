import * as _ from 'lodash';

import { pathTo } from '../lib/player';

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
      findPathBtn: $panel('.find-path button') as HTMLButtonElement,
      findPathX: $panel('.find-path #coord-x') as HTMLInputElement,
      findPathY: $panel('.find-path #coord-y') as HTMLInputElement,
      mouseCoords: $panel('#mouse-coords') as HTMLSpanElement,
    };

    // Path finder

    el.findPathBtn.onclick = () => {
      const x = parseInt(el.findPathX.value, 10);
      const y = parseInt(el.findPathY.value, 10);

      console.log('Path: ', pathTo(x, y));
    };

    // Mouse coords

    const throttled = _.throttle(e => {
      const pos = translateMousePosition(e.clientX, e.clientY);
      el.mouseCoords.innerHTML = `{x: ${pos.i}, y: ${pos.j}}`;
    }, 100);

    document.body.addEventListener('mousemove', throttled);
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
