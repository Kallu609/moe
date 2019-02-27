import * as _ from 'lodash';

import * as logger from '../utils/logger';
import { sleep } from '../utils/waitUntil';

export abstract class ScriptBase {
  running: boolean;
  stopFlag: boolean = false;
  currentAction: string;
  stopAction: () => void;

  constructor(public name: string) {}

  abstract getAction(): () => void;

  async run() {
    let actionsPerSecond = 0;
    let startTime = +new Date();

    while (this.running && !this.stopFlag) {
      const action = this.getAction();
      await action();
      actionsPerSecond++;

      if (actionsPerSecond > 10) {
        logger.log(
          `[SCRIPT] Possible infinite loop, check code! (${this.currentAction})`
        );
        break;
      }

      const deltaTime = +new Date() - startTime;
      if (deltaTime > 1000) {
        startTime = +new Date();
        actionsPerSecond = 0;
      }
    }

    this.running = false;
    this.stopFlag = false;
    this.stopAction();
    logger.log(`[SCRIPT] "${this.name}" stopped`);
  }

  setStopAction(action: () => void) {
    this.stopAction = action;
  }

  start() {
    this.running = true;
    this.stopFlag = false;
    this.run();
    logger.log(`[SCRIPT] "${this.name}" started`);
  }

  stop() {
    this.stopFlag = true;
    logger.log(`[SCRIPT] "${this.name}" stopping...`);
  }

  sleep = async (min: number, max: number) => {
    const sleepTime = _.random(min, max);
    const oldAction = this.currentAction;
    this.currentAction = `Sleeping for ${sleepTime}ms`;
    await sleep(sleepTime);
    this.currentAction = oldAction;
  };
}
