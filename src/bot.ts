import config from './config';
import { waitForConnection } from './lib/game';
import { Panel } from './panel/panel';
import { captchaDetector } from './utils/2captcha';
import * as logger from './utils/logger';
import { sleep } from './utils/waitUntil';

export let ws: WebSocket;

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

    this.startWebSocket();
    this.chatTextProxy();
    this.socketOutProxy();
    this.socketInProxy();

    captchaDetector();
    pageHidden = () => {
      // Replace original function
    };
    logger.log('[@] Bot loaded.');
  }

  socketOutProxy() {
    const fnOriginal = Socket.send;
    const proxy = new Proxy(fnOriginal, {
      apply: (fn, ctx, args) => {
        if (this.panel.socketTrafficOut) {
          console.log('[SOCKET] ->', args);
        }

        return fn.apply(ctx, args);
      },
    });

    Socket.send = proxy;
  }

  socketInProxy() {
    socket.on('message', (data: any) => {
      if (this.panel.socketTrafficIn) {
        console.log('[SOCKET] <-', data);
      }
    });
  }

  chatTextProxy() {
    const fnOriginal = addChatText;
    const proxy = new Proxy(fnOriginal, {
      apply: (fn, ctx, args) => {
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify(args));
        }

        return fn.apply(ctx, args);
      },
    });

    addChatText = proxy;
  }

  startWebSocket = () => {
    ws = new WebSocket('ws://localhost:1337');

    ws.onopen = () => {
      logger.log('[SOCKET] Connected');
    };

    ws.onmessage = (ev: MessageEvent) => {
      const data = JSON.parse(ev.data);

      if (data.type === 'chat message') {
        Socket.send('message', { data: data.text, lang: data.channel });
      }
    };

    ws.onclose = () => {
      logger.log('[SOCKET] Disconnected');

      setTimeout(() => {
        this.startWebSocket();
      }, 2500);
    };
  };
}

(() => {
  // tslint:disable-next-line:no-unused-expression
  new Bot();
})();
