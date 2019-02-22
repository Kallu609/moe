export async function waitForConnection() {
  return new Promise((resolve, reject) => {
    function checkConnection() {
      if (game_timestamp.connected && typeof Mods !== 'undefined') {
        return resolve();
      }

      setTimeout(() => {
        checkConnection();
      }, 100);
    }

    checkConnection();
  });
}
