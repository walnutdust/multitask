import { useFrame } from "@react-three/fiber";
import { Physics, useBox, useCompoundBody } from "@react-three/cannon";
import { useState, useEffect } from "react";
import { MeshStandardMaterial, Vector3 } from "three";
import type { Triplet, ShapeType } from "@react-three/cannon";

import { useControls } from "../utils/useControls";
import useStore, { GAMES, GAME_STATE } from "../state/state";
import MiniScene from "../components/MiniScene";
import Ball from "../components/Ball";
import { useMemo } from "react";
import Text from "../components/Text";
import useReset from "../utils/useReset";

/**
 * Constants
 */

const VELOCITY = 15;

const ARENA_WIDTH = 20;
const ARENA_WALL_THICKNESS = 0.5;
const ARENA_WALL_HEIGHT = 4;
const DISPLACEMENT = (ARENA_WIDTH - ARENA_WALL_THICKNESS) / 2;

const TIME_TILL_GAME_OVER = 5000;
const TIME_BETWEEN_ITEM_SPAWN = 3000;

const BOX_MATERIAL = new MeshStandardMaterial({ color: "#ad8b00" });
const ARENA_WALLS: {
  args: Triplet;
  position?: Triplet;
  type: ShapeType;
}[] = [
  {
    args: [ARENA_WIDTH, ARENA_WALL_HEIGHT, ARENA_WALL_THICKNESS],
    position: [0, ARENA_WALL_HEIGHT / 2, DISPLACEMENT],
    type: "Box",
  },
  {
    args: [ARENA_WIDTH, ARENA_WALL_HEIGHT, ARENA_WALL_THICKNESS],
    position: [0, ARENA_WALL_HEIGHT / 2, -DISPLACEMENT],
    type: "Box",
  },
  {
    args: [ARENA_WALL_THICKNESS, ARENA_WALL_HEIGHT, ARENA_WIDTH],
    position: [DISPLACEMENT, ARENA_WALL_HEIGHT / 2, 0],
    type: "Box",
  },
  {
    args: [ARENA_WALL_THICKNESS, ARENA_WALL_HEIGHT, ARENA_WIDTH],
    position: [-DISPLACEMENT, ARENA_WALL_HEIGHT / 2, 0],
    type: "Box",
  },
];

const ARENA_FLOOR: {
  args: [number, number];
  rotation?: Triplet;
  type: ShapeType;
} = {
  args: [ARENA_WIDTH, ARENA_WIDTH],
  rotation: [-Math.PI / 2, 0, 0],
  type: "Plane",
};

/**
 * Classes
 */

const Item = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastSpawn, setLastSpawn] = useState<number>(0);
  const [currTimeout, setCurrTimeout] = useState<number>();
  const timer = useStore((state) => state.timer);
  const isInPlay = useStore((state) => state.gamesMap.COLLECT);

  const [ref, api] = useBox(() => ({
    args: [1, 1, 1],
    mass: 1,
    position: [5, 1, 0],
    type: "Static",
    onCollide: () => {
      // After collision, set the item to be outside the arena to avoid
      // multiple collisions
      api.position.set(0, -2, 0);
      setIsVisible(() => false);
    },
  }));

  const endGame = useStore((state) => state.api.endGame);

  useReset(() => {
    setLastSpawn(timer.timeElapsed);
    api.position.set(5, 1, 0);
  }, GAMES.COLLECT);

  useEffect(() => {
    if (!isInPlay) return;

    if (isVisible) {
      setCurrTimeout(timer.setTimeout(() => endGame(), TIME_TILL_GAME_OVER));
      return;
    }

    if (currTimeout) timer.removeTimeout(currTimeout);

    setCurrTimeout(
      timer.setTimeout(() => {
        setIsVisible(true);
        api.position.set(
          (Math.random() - 0.5) * (ARENA_WIDTH - 2 * ARENA_WALL_THICKNESS),
          0.5,
          (Math.random() - 0.5) * (ARENA_WIDTH - 2 * ARENA_WALL_THICKNESS)
        );

        if (!ref.current?.scale) return;
        ref.current.scale.x = 1;
        ref.current.scale.y = 1;
        ref.current.scale.z = 1;

        setLastSpawn(timer.timeElapsed);
      }, TIME_BETWEEN_ITEM_SPAWN)
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, isInPlay]);

  useFrame(() => {
    if (!ref.current?.scale) return;
    if (!isInPlay) return;

    const alpha =
      (TIME_TILL_GAME_OVER - timer.timeElapsed + lastSpawn) /
      TIME_TILL_GAME_OVER;

    ref.current.scale.x = alpha;
    ref.current.scale.y = alpha;
    ref.current.scale.z = alpha;
  });

  return (
    <mesh ref={ref} visible={isVisible}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </mesh>
  );
};

const Arena = () => {
  const [arenaRef] = useCompoundBody(() => ({
    shapes: [...ARENA_WALLS],
  }));

  const wall_meshes = useMemo(
    () =>
      ARENA_WALLS.map(({ position, args }, index) => (
        <mesh position={position} material={BOX_MATERIAL} key={index}>
          <boxGeometry args={args} />
        </mesh>
      )),
    []
  );

  return (
    <group ref={arenaRef} name="Arena">
      {wall_meshes}

      <mesh rotation={ARENA_FLOOR.rotation}>
        <planeGeometry args={ARENA_FLOOR.args} />
        <meshStandardMaterial color="#d4b106" />
      </mesh>

      <Text
        textProps={{
          size: 20,
        }}
        meshProps={{ rotation: [-Math.PI / 2, 0, 0] }}
        position={[0, 0, -1]}
        color="#614700"
      >
        WSAD / ZQSD
      </Text>
      <Text
        textProps={{
          size: 15,
        }}
        meshProps={{ rotation: [-Math.PI / 2, 0, 0] }}
        position={[0, 0, 1]}
        color="#614700"
      >
        to Move
      </Text>
    </group>
  );
};

const CollectScene = ({ displacement }: { displacement: Vector3 }) => {
  const controls = useControls();

  return (
    <MiniScene
      name="CollectScene"
      directionalLightPosition={new Vector3(10, 20, 5)}
      displacement={displacement}
    >
      <Ball
        game={GAMES.COLLECT}
        position={[0, 0.5, 0]}
        useFrameFn={(ref, api) => () => {
          if (!ref.current) return;

          const { keyboardUp, keyboardDown, keyboardLeft, keyboardRight } =
            controls.current;

          if (!(keyboardUp || keyboardDown || keyboardLeft || keyboardRight)) {
            api.velocity.set(0, 0, 0);
            return;
          }

          const newVelocity = [0, 0, 0];

          if (keyboardUp && !keyboardDown) newVelocity[2] = -VELOCITY;
          if (!keyboardUp && keyboardDown) newVelocity[2] = VELOCITY;
          if (keyboardLeft && !keyboardRight) newVelocity[0] = -VELOCITY;
          if (!keyboardLeft && keyboardRight) newVelocity[0] = VELOCITY;

          api.velocity.set(newVelocity[0], newVelocity[1], newVelocity[2]);
        }}
      />
      <Arena />
      <Item />
    </MiniScene>
  );
};

const Collect = ({ displacement }: { displacement: Vector3 }) => {
  const gameState = useStore((state) => state.state);
  const isInPlay = useStore((state) => state.gamesMap.COLLECT);

  return (
    <Physics
      isPaused={!(gameState === GAME_STATE.PLAYING && isInPlay)}
      defaultContactMaterial={{ restitution: 0, friction: 0 }}
      gravity={[0, 0, 0]}
    >
      <CollectScene displacement={displacement} />
    </Physics>
  );
};

export default Collect;
