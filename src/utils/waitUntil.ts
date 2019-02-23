export function waitUntil(condition: () => boolean, interval = 100) {
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
