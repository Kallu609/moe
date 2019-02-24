import { fail } from 'assert';
import * as queryString from 'query-string';

import config from '../config';
import { waitUntil } from './waitUntil';

const $ = document.querySelector.bind(document);
const captchaEl = $('#numcaptcha2_img') as HTMLDivElement;
const captchaBonusEl = $('#captcha_bonus_assign_form') as HTMLDivElement;
const captchaResponseEl = $('#captcha_response') as HTMLSpanElement;

export function captchaDetector() {
  let failSafe = 0;
  let checkingCaptcha = false;

  const interval = setInterval(async () => {
    if (!captchaEl.getAttribute('style')!.includes('url') || checkingCaptcha) {
      return;
    }

    checkingCaptcha = true;

    while (true) {
      console.log('Detected captcha image!');

      const base64 = captchaEl
        .getAttribute('style')!
        .split('url("')[1]
        .split('"')[0];

      const answer = await solveCaptcha(base64);

      if (answer) {
        Socket.send('captcha', { value: answer });
        console.log('Got captcha answer: ' + answer);

        await waitUntil(
          () =>
            captchaBonusEl.style.display === 'block' ||
            captchaResponseEl.style.display === 'block'
        );

        captchaEl.setAttribute(
          'style',
          'display:inline-block;background-repeat:no-repeat;'
        );

        // Captcha FAILED
        if (captchaResponseEl.style.display === 'block') {
          captchaResponseEl.style.display = 'none';
          CaptchaControl.render(); // Generate new captcha
          continue;
        }

        // $('#captcha_bonus_assign_form').style.display = 'none';
        captcha = false;
        failSafe = 0;
        break;
      } else {
        console.log('No answer :( Trying again');
        failSafe++;

        if (failSafe >= 3) {
          clearInterval(interval);
        }
      }
    }

    checkingCaptcha = false;
  }, 3000);
}

export function solveCaptcha(base64: string) {
  return new Promise(async (resolve, reject) => {
    if (!config.captchaApiKey) {
      console.log('No 2captcha API key');
      return reject();
    }

    const sendRequest = await fetch('http://2captcha.com/in.php', {
      method: 'POST',
      redirect: 'follow',
      keepalive: true,
      mode: 'cors',
      body: queryString.stringify({
        key: config.captchaApiKey,
        method: 'base64',
        body: base64,
      }),
    });
    const sendResponse = await sendRequest.text();

    if (!sendResponse.includes('OK')) {
      console.log('Failed to solve captcha');
      return reject();
    }

    const captchaId = sendResponse.split('|')[1];

    const readInterval = setInterval(async () => {
      console.log('Checking for captcha answer');

      const resultRequest = await fetch(
        'http://2captcha.com/res.php?' +
          queryString.stringify({
            key: config.captchaApiKey,
            action: 'get',
            id: captchaId,
          })
      );

      const readResponse = await resultRequest.text();

      if (readResponse.includes('OK')) {
        const captchaAnswer = readResponse.split('|')[1];
        resolve(captchaAnswer);
        clearInterval(readInterval);
      }
    }, 5000);
  });
}
