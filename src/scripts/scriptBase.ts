import * as _ from 'lodash';

import * as logger from '../utils/logger';
import { sleep } from '../utils/waitUntil';

export abstract class ScriptBase {
  running: boolean;
  stopFlag: boolean = false;
  currentAction: string;

  constructor(public name: string) {}

  abstract getAction(): () => void;

  async run() {
    let actionsFired = 0;
    let actionsPerSecond = 0;

    const apsInterval = setInterval(() => {
      actionsPerSecond = actionsFired;
      actionsFired = 0;
    }, 1000);

    while (this.running && !this.stopFlag) {
      const action = this.getAction();
      await action();
      actionsFired++;

      if (actionsPerSecond > 10) {
        console.log(
          `[SCRIPT] Possible infinite loop, check code! (${this.currentAction})`
        );
        break;
      }
    }

    clearInterval(apsInterval);
    this.running = false;
    this.stopFlag = false;
    logger.log(`[SCRIPT] "${this.name}" stopped`);
  }

  start() {
    this.running = true;
    this.run();
    logger.log(`[SCRIPT] "${this.name}" started`);
  }

  stop() {
    this.stopFlag = true;
    logger.log(`[SCRIPT] "${this.name}" stopping...`);
  }

  sleep = async (min: number, max: number) => {
    const sleepTime = _.random(min, max);
    this.currentAction = `Sleeping for ${sleepTime}ms`;
    await sleep(sleepTime);
  };
}
