import config from './config';
import { waitForConnection } from './lib/game';
import { Panel } from './panel/panel';
import { captchaDetector } from './utils/2captcha';
import * as logger from './utils/logger';
import { sleep } from './utils/waitUntil';

export class Bot {
  panel: Panel;
  ws: WebSocket;

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
        if (this.ws && this.ws.readyState === 1) {
          this.ws.send(JSON.stringify(args));
        }

        return fn.apply(ctx, args);
      },
    });

    addChatText = proxy;
  }

  startWebSocket = () => {
    this.ws = new WebSocket('ws://localhost:1337');

    this.ws.onopen = () => {
      console.log('Connected to websocket');
    };

    this.ws.onmessage = (ev: MessageEvent) => {
      const data = JSON.parse(ev.data);

      if (data.type === 'chat message') {
        Socket.send('message', { data: data.text, lang: data.channel });
      }
    };

    this.ws.onclose = () => {
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
