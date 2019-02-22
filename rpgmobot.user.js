// ==UserScript==
// @name          RPGMOBot
// @namespace     http://www.rpg.mo.com/
// @match         *://*.mo.ee/*
// ==/UserScript==

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `${src}?${Math.floor(Math.random() * 100000000)}`;
    script.addEventListener('load', resolve);
    script.addEventListener('error', () => reject('Error loading script.'));
    script.addEventListener('abort', () => reject('Script loading aborted.'));
    document.head.appendChild(script);
  });
}

injectScript('http://localhost:8080/bot.js')
  .then(() => {
    console.log('Script loaded!');
  })
  .catch(error => {
    console.log(error);
  });
