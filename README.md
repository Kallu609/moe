# RPG.MO.ee bot

Automates actions in RPG MO

![Example](https://i.imgur.com/88cddF6.png)

## Requirements

- Node.js
- 2Captcha account
- Firefox Developer Edition (Because of cors problems with Chrome)
- [CORS Everywhere](https://addons.mozilla.org/fi/firefox/addon/cors-everywhere/) addon
- [Violent monkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) addon

## Installation & Using

1. Install `rpgmobot.user.js` userscript
2. Make copy of `.env.example` to `.env` and fill with your details
3. Run `npm install`
4. Run `npm start`
5. Navigate to http://rpg.mo.ee. You should see bot window in the bottom-right corner

## Notes

Script starting locations vary. Check correct start locations from corresponding script.
You need to have required items equipped when starting scripts.

Some scripts may not be working and there's probably lots of dead code. The project is highly customized to my needs so don't expect it to be final product.
