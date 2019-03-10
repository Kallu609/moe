import { ws } from '../bot';

export function turnOnSleepMode() {
  ws.send(
    JSON.stringify({
      type: 'sleepmode',
    })
  );
}
