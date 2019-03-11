import * as _ from 'lodash';

import { customPathTo } from '../lib/path';
import { ScriptBase } from './shared/scriptBase';

const movementState = {
  done: 'done',
  monsterInWay: 'monster in way',
  runAway: 'fighting',
  failed: 'failed',
};

export class TesterScript extends ScriptBase {
  getAction() {
    return this.test;
  }

  test = async () => {
    await this.pathExecute(`
      move [21,84]
      move [21,82]
      move [19,82]
      move [19,84]
      move [21,84]
      move [21,90]
      move [19,90]
      move [25,90]
      teleport [25,88]
      move [24,88]
      move [24,87]
      move [26,87]
      move [24,87]
      move [24,88]
      teleport [22,88]
      move [21,84]
      move [21,82]
      move [24,82]
      move [24,85]
      move [26,85]
    `);
  };
}
