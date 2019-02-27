import * as queryString from 'query-string';

import config from '../config';
import * as logger from './logger';
import { sleep, waitUntil } from './waitUntil';

const $ = document.querySelector.bind(document);
const captchaEl = $('#numcaptcha2_img') as HTMLDivElement;
const captchaBonusEl = $('#captcha_bonus_assign_form') as HTMLDivElement;
const captchaResponseEl = $('#captcha_response') as HTMLSpanElement;

export async function captchaDetector() {
  let wrongCaptchaCounter = 0;

  while (true) {
    if (!captchaEl.getAttribute('style')!.includes('url')) {
      await sleep(3000);
      continue;
    }

    logger.log('[CAPTCHA] Detected captcha image');
    const image = getCaptchaBase64();
    let captchaErrorCounter = 0;

    while (true) {
      const answer = await solveCaptcha(image);

      if (answer) {
        Socket.send('captcha', { value: answer });
        logger.log('[CAPTCHA] Captcha answer: ' + answer);

        await waitUntil(
          () =>
            captchaBonusEl.style.display === 'block' ||
            captchaResponseEl.style.display === 'block'
        );

        // Captcha FAILED
        if (captchaResponseEl.style.display === 'block') {
          logger.log('[CAPTCHA] Wrong captcha answer');
          captchaResponseEl.style.display = 'none';
          wrongCaptchaCounter++;

          if (wrongCaptchaCounter >= 3) {
            logger.log('[CAPTCHA] Refreshing captcha');
            wrongCaptchaCounter = 0;
            await refreshCaptcha();
            break;
          }

          continue;
        }

        logger.log('[CAPTCHA] Successfully solved');

        removeCaptchaImage();
        captcha = false; // Required by mo.ee
        penalty_bonus();

        await sleep(3000);
        captchaBonusEl.style.display = 'none';
        wrongCaptchaCounter = 0;
        break;
      }

      captchaErrorCounter++;

      if (captchaErrorCounter >= 3) {
        logger.log(
          '[CAPTCHA] Tried too many times without answer. Skipping captcha'
        );
        captchaEl.style.display = 'none';
        removeCaptchaImage();
        break;
      }

      logger.log('[CAPTCHA] No answer, trying again');
    }
  }
}

function getCaptchaBase64() {
  return captchaEl
    .getAttribute('style')!
    .split('url("')[1]
    .split('"')[0];
}

function removeCaptchaImage() {
  captchaEl.setAttribute(
    'style',
    'display:inline-block;background-repeat:no-repeat;'
  );
}

async function refreshCaptcha() {
  Socket.send('captcha', { sub: 'refresh' });

  await waitUntil(() =>
    (captchaEl.getAttribute('style') as string).includes('url')
  );
}

export function solveCaptcha(base64: string) {
  return new Promise(async (resolve, reject) => {
    if (!config.captchaApiKey) {
      logger.log('[CAPTCHA] No 2captcha API key');
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
        min_len: 5,
        max_len: 5,
        numeric: 1,
      }),
    });
    const sendResponse = await sendRequest.text();

    if (!sendResponse.includes('OK')) {
      logger.log('[CAPTCHA] Failed to solve captcha');
      return reject();
    }

    const captchaId = sendResponse.split('|')[1];

    while (true) {
      // logger.log('[CAPTCHA] Checking for captcha answer');

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
        return resolve(captchaAnswer);
      } else if (readResponse.includes('NOT_READY')) {
        await sleep(5000);
      } else {
        logger.log('[CAPTCHA] Error with captcha: ' + readResponse);
        return resolve(false);
      }
    }
  });
}
