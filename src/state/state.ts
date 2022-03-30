import create from "zustand";
import { ViewArgs } from "../utils/view";
import Timer from "./Timer";

export enum GAME_STATE {
  PAUSED = "PAUSED",
  PLAYING = "PLAYING",
  GAME_OVER = "GAME OVER",
  NEW = "NEW ",
}

export enum GAMES {
  FLAPPY = "FLAPPY",
  JUMP = "JUMP",
  BALANCE = "BALANCE",
  COLLECT = "COLLECT",
}

type State = {
  api: {
    togglePaused: () => void;
    incrementScore: () => void;
    endGame: () => void;
    startMiniGame: (game: GAMES) => void;
    startGame: (views: ViewArgs[]) => void;
    getState: () => State;
  };
  score: number;
  state: GAME_STATE;
  gamesMap: Record<GAMES, boolean>;
  timer: Timer;
};

const defaultGamesMap: Record<GAMES, boolean> = {
  FLAPPY: false,
  JUMP: false,
  BALANCE: false,
  COLLECT: false,
};

export default create<State>((set, get) => ({
  api: {
    togglePaused: () =>
      set((state) => {
        // Toggling pause should only work if the current game state is either
        // paused or playing.
        if (
          state.state !== GAME_STATE.PAUSED &&
          state.state !== GAME_STATE.PLAYING
        ) {
          return state;
        }

        let newState: GAME_STATE;

        if (state.state === GAME_STATE.PAUSED) {
          state.timer.resume();
          newState = GAME_STATE.PLAYING;
        } else {
          state.timer.pause();
          newState = GAME_STATE.PAUSED;
        }

        return { ...state, state: newState };
      }),
    incrementScore: () =>
      set((state) => ({
        ...state,
        score:
          state.state === GAME_STATE.PLAYING ? state.score + 1 : state.score,
      })),

    endGame: () =>
      set((state) => {
        // Pause rather than reset the timer to preserve the scene and
        // timer.
        state.timer.pause();

        return {
          ...state,
          state: GAME_STATE.GAME_OVER,
          gamesMap: { ...defaultGamesMap },
        };
      }),

    startGame: (views: ViewArgs[]) =>
      set((state) => {
        const { timer, api } = state;

        timer.reset();
        timer.start();

        timer.subscribe(() => api.incrementScore(), 1000);

        views.forEach((view) => {
          timer.setTimeout(
            () => api.startMiniGame(view.gameType),
            view.startTime
          );
        });

        return {
          ...state,
          score: 0,
          state: GAME_STATE.PLAYING,
        };
      }),

    startMiniGame: (game: GAMES) => {
      set((state) => ({
        ...state,
        gamesMap: {
          ...state.gamesMap,
          [game]: true,
        },
      }));
    },

    getState: () => get(),
  },
  score: 0,
  state: GAME_STATE.PLAYING,
  gamesMap: { ...defaultGamesMap },
  timer: Timer.getInstance(),
}));
