import { waitUntil } from '../utils/waitUntil';

export const waitForConnection = async () =>
  waitUntil(() => !!game_timestamp.connected && typeof Mods !== 'undefined');
