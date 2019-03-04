import * as _ from 'lodash';

export function waitUntil(
  condition: () => boolean | Promise<boolean>,
  interval = 100
) {
  return new Promise((resolve, reject) => {
    function waitFor() {
      if (condition()) {
        return resolve();
      }

      setTimeout(() => {
        waitFor();
      }, interval);
    }

    waitFor();
  });
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const sleepRandom = (min: number, max: number) => {
  const sleepTime = _.random(min, max);
  return new Promise(resolve => setTimeout(resolve, sleepTime));
};
