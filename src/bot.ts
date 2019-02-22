import config from './config';
import { waitForConnection } from './lib/game';
import { Panel } from './panel/panel';
import * as logger from './utils/logger';

export class Bot {
  panel: Panel;

  constructor() {
    this.start();
  }

  async start() {
    await waitForConnection();
    this.panel = new Panel();

    if (config.username && config.password) {
      do_login(config.username, config.password);
    }

    logger.log('[@] Bot loaded.');
  }
}

(() => {
  // tslint:disable-next-line:no-unused-expression
  new Bot();
})();
