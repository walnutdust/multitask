import { Triplet } from "@react-three/cannon";
import { Color, Vector3, Vector4 } from "three";
import type { GAMES } from "../state/state";

type RawViewArgs = {
  background: Color;
  cameraRelToCenter: Triplet;
  game: ({ displacement }: { displacement: Vector3 }) => JSX.Element;
  gameType: GAMES;
};

type ViewArgs = {
  background: Color;
  cameraRelToCenter: Triplet;
  game: ({ displacement }: { displacement: Vector3 }) => JSX.Element;
  startTime: number;
  gameType: GAMES;
  displacement: Triplet;
};

/**
 * Returns the viewport args (left, bottom, height, width) for screen index out
 * of numViews screens. This function will arrange the screens in two rows, akin
 * to the following:
 *
 * Even number of views:
 * 1 3 5
 * 0 2 4 ...
 *
 * For an odd number of views, the last view will take up the full height:
 * 1 3 4
 * 0 2 4
 *
 * In addition, this function also processes the numViews-th screen (not shown
 * on the viewport yet) to ensure that we can perform a smooth transition.
 *
 * @param index screnIndex.
 * @param numViews number of views/screens.
 *
 * @pre 0 <= index <= numViews
 * @pre numViews >= 0
 *
 * @returns Vector4 for the viewport args.
 */
const getViewportArgs = (index: number, numViews: number): Vector4 => {
  if (numViews === 0 && index === 0) {
    return new Vector4(
      Math.floor(window.innerWidth), // left
      0, // bottom
      Math.floor(window.innerWidth), // width
      Math.floor(window.innerHeight) // height
    );
  }

  const numRows = numViews >= 2 ? 2 : 1;
  const numCols = Math.ceil(numViews / 2);

  // Values for a "cell"
  const standardWidth = Math.floor((1 / numCols) * window.innerWidth);
  const standardHeight = Math.floor((1 / numRows) * window.innerHeight);

  // If we are dealing with the next screen to enter the viewport,
  if (index === numViews) {
    if (index % 2 === 0) {
      // If it has an even index, we want it to enter from the right and take
      // the full height.

      return new Vector4(
        Math.floor(window.innerWidth), // left
        0, // bottom
        standardWidth, // width
        Math.floor(window.innerHeight) // height
      );
    } else {
      // If it has an odd index, we want it to enter from the top.

      return new Vector4(
        Math.floor(index / 2) * standardWidth, // left
        Math.floor(window.innerHeight), // bottom
        standardWidth, // width
        standardHeight // height
      );
    }
  }

  // If there are an odd number of views in the viewport (thus the last view has
  // an even index), make it take up the full height.
  if (index === numViews - 1 && index % 2 === 0) {
    return new Vector4(
      (index / 2) * standardWidth, // left
      0, // bottom
      standardWidth, // width
      Math.floor(window.innerHeight) // height
    );
  }

  // Otherwise assign it a cell.
  return new Vector4(
    Math.floor(index / 2) * standardWidth, // left
    index % 2 === 0 ? 0 : standardHeight, // bottom
    standardWidth, // width
    standardHeight // height
  );
};

/**
 * Utility method to compute viewport args for views.
 *
 * @param numViews Number of views
 *
 * @return Array of viewport args for the views.
 */
const getViewportArgsForAllViews = (numViews: number): Vector4[] =>
  Array(numViews + 1)
    .fill(undefined)
    .map((_, index) => getViewportArgs(index, numViews));

/**
 * Process raw view arguments to compute the start times and displacement.
 *
 * @param views Raw view configuration
 * @param far Camera far setting
 * @param timeBetweenGames Time before the next game should start
 * @returns Array of processed ViewArgs
 */
const processViewArgs = (
  views: RawViewArgs[],
  far: number,
  timeBetweenGames: number
): ViewArgs[] =>
  views.map((view, index) => {
    // Displace each scene by far * 3 so that no scene items will appear on
    // the other scenes
    const distanceBetweenScenes = far * 3;
    const displacement: Triplet = [
      index * distanceBetweenScenes,
      index * distanceBetweenScenes,
      index * distanceBetweenScenes,
    ];

    return {
      ...view,
      startTime: timeBetweenGames * index,
      displacement,
    };
  });

/**
 * Utility function to determine which views should be shown before and after
 * animation.
 *
 * @param views The views to choose from.
 * @param timeElapsed Amount of time elapsed
 * @param animationTime Animation time.
 * @returns
 */
const getRelevantViews = (
  views: ViewArgs[],
  timeElapsed: number,
  animationTime: number
): [ViewArgs[], ViewArgs[]] => {
  return [
    views.filter((view) => view.startTime <= timeElapsed),
    views.filter((view) => view.startTime - animationTime <= timeElapsed),
  ];
};

export { getViewportArgsForAllViews, processViewArgs, getRelevantViews };
export type { RawViewArgs, ViewArgs };
