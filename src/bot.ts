import config from './config';
import { waitForConnection } from './lib/game';
import { Panel } from './panel/panel';
import { captchaDetector } from './utils/2captcha';
import * as logger from './utils/logger';
import { sleep } from './utils/waitUntil';

export class Bot {
  panel: Panel;

  constructor() {
    this.start();
  }

  async start() {
    await waitForConnection();
    this.panel = new Panel();

    if (config.username && config.password) {
      while (players[0].name === 'Name') {
        do_login(config.username, config.password);
        await sleep(500);
      }
    }

    captchaDetector();
    pageHidden = () => {
      // Replace original function
    };
    logger.log('[@] Bot loaded.');
  }
}

(() => {
  // tslint:disable-next-line:no-unused-expression
  new Bot();
})();
