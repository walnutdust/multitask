import { Color, Vector4 } from "three";
import { GAMES } from "../state/state";
import Balance from "../tasks/Balance";
import Collect from "../tasks/Collect";
import Flappy from "../tasks/Flappy";
import Jump from "../tasks/Jump";

import {
  processViewArgs,
  RawViewArgs,
  getViewportArgsForAllViews,
} from "../utils/view";

const config = {
  FAR: 100,
  TIME_BETWEEN_GAMES: 10000,
  ANIMATION_TIME: 2000,
};

const rawViews: RawViewArgs[] = [
  {
    background: new Color(0.5, 0.5, 0.7),
    cameraRelToCenter: [-4, 5, 7],
    gameType: GAMES.JUMP,
    Game: Jump,
  },
  {
    background: new Color(0.7, 0.5, 0.5),
    cameraRelToCenter: [-4, 3, 7],
    gameType: GAMES.BALANCE,
    Game: Balance,
  },
  {
    background: new Color("#ffffb8"),
    Game: Collect,
    gameType: GAMES.COLLECT,
    cameraRelToCenter: [0, 25, 0],
  },
  {
    background: new Color("#bae7ff"),
    cameraRelToCenter: [-8, 0, 20],
    gameType: GAMES.FLAPPY,
    Game: Flappy,
  },
];

const views = processViewArgs(rawViews, config.FAR, config.TIME_BETWEEN_GAMES);

/**
 * Utility function to return a nested array of view positions. On the first
 * level of the nesting, we have (views.length + 1), corresponding to the
 * different states when 0 to views.length views are visible. The second level
 * of nesting describes the positions for each item in the viewport, as well
 * as the next item to enter the screen to ensure a smooth transition.
 *
 * @post The length of the result[i] is i+1
 */
const viewPositions: Vector4[][] = Array(views.length + 1)
  .fill(undefined)
  .map((_, index) => getViewportArgsForAllViews(index));

export default config;
export { views, viewPositions };
