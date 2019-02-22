import { IPlayer, IPlayers } from './players';
import { IPosition } from './world';

declare global {
  const Mods: {
    loadedMods: string[];
  };
  const players: IPlayers;
  const game_timestamp: {
    init?: number;
    onLoad?: number;
    loaded?: number;
    finished?: number;
    connected?: number;
  };

  function findPathFromTo(
    player: IPlayer,
    pos: IPosition,
    playerMapRef: IPlayer // ???
  ): IPosition[];

  const createElem: (
    tagName: string,
    target: Node,
    options: {
      innerHTML: string;
    }
  ) => void;

  const do_login: (username: string, password: string) => void;
  const translateMousePosition: (x: number, y: number) => IPosition;
}
