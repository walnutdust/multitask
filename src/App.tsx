import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect } from "react";

import useStore, { GAME_STATE } from "./state/state";

import config, { views, viewPositions } from "./config/experience";

import "./App.css";
import { PerspectiveCamera, Vector3, Vector4 } from "three";
import { getRelevantViews } from "./utils/view";
import { Stats } from "@react-three/drei";

const MultiScene = () => {
  const timer = useStore((state) => state.timer);

  useFrame((state) => {
    const { gl, camera, scene } = state;
    timer.update();

    if (!timer.isRunning) return;

    const targets = scene.children.filter(
      (child) => child.userData?.isMiniScene
    );

    const [oldViews, newViews] = getRelevantViews(
      views,
      timer.timeElapsed,
      config.ANIMATION_TIME
    );

    const alpha =
      (timer.timeElapsed -
        (newViews[newViews.length - 1].startTime - config.ANIMATION_TIME)) /
      config.ANIMATION_TIME;

    for (let i = 0; i < newViews.length; i++) {
      const view = newViews[i];

      const oldVals = viewPositions[oldViews.length][i];
      const newVals = viewPositions[newViews.length][i];

      const vals = new Vector4().lerpVectors(
        oldVals,
        newVals,
        alpha > 1 ? 1 : alpha
      );

      gl.setViewport(vals);
      gl.setScissor(vals);
      gl.setScissorTest(true);
      gl.setClearColor(view.background);

      const [x, y, z] = view.displacement;
      const [cameraX, cameraY, cameraZ] = view.cameraRelToCenter;

      camera.position.set(x + cameraX, y + cameraY, z + cameraZ);
      camera.lookAt(x, y, z);

      if (camera instanceof PerspectiveCamera) camera.aspect = vals.z / vals.w;

      camera.updateProjectionMatrix();

      gl.render(targets[i], camera);
    }
  }, 1);

  return null;
};

const PauseOverlay = () => {
  const gameState = useStore((state) => state.state);

  if (gameState !== GAME_STATE.PAUSED) return null;

  return (
    <div className="overlay">
      <h1 className="overlay-text">Paused</h1>
      <p>Press 'P' to continue</p>
    </div>
  );
};

const GameOverOverlay = () => {
  const gameState = useStore((state) => state.state);
  const score = useStore((state) => state.score);

  if (gameState !== GAME_STATE.GAME_OVER) return null;

  return (
    <div className="overlay">
      <h1 className="overlay-text">Game Over</h1>
      <p>Score: {score}</p>
      <p>Press 'R' to restart!</p>
    </div>
  );
};

const Overlays = () => {
  const score = useStore((state) => state.score);
  return (
    <>
      <Stats showPanel={0} className="stats" />
      <GameOverOverlay />
      <PauseOverlay />
      <div className="score">{score}</div>
    </>
  );
};

export default function App() {
  const api = useStore((state) => state.api);
  const timer = useStore((state) => state.timer);

  useEffect(() => {
    const handleKeydown = ({ key }: KeyboardEvent) => {
      if (key === "p") api.togglePaused();
      if (key === "r") {
        api.endGame();
        api.startGame(views);
      }
    };
    window.addEventListener("keydown", handleKeydown);

    api.startGame(views);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      timer.reset();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Overlays />
      <Canvas camera={{ fov: 50, far: config.FAR }} shadows>
        <MultiScene />
        {views.map(({ Game, displacement }) => (
          <Game
            displacement={
              new Vector3(displacement[0], displacement[1], displacement[2])
            }
            key={displacement[0]}
          />
        ))}
      </Canvas>
    </>
  );
}
