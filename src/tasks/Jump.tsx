import { useBox, Physics, CollideEvent } from "@react-three/cannon";
import create from "zustand";

import type { Triplet } from "@react-three/cannon";
import { Object3D, Event, Vector3, MeshStandardMaterial } from "three";

import { useControls } from "../utils/useControls";
import useStore, { GAME_STATE, GAMES } from "../state/state";
import Ball from "../components/Ball";
import MiniScene from "../components/MiniScene";
import Text from "../components/Text";
import useNet from "../utils/useNet";
import { useMemo } from "react";
import useReset from "../utils/useReset";

/**
 * Jumping game configuration.
 */

type StoneConfig = {
  width: number;
  height: number;
  initialVelocity: number;
};

type JumpExperienceConfig = {
  numberOfStones: number;
};

type JumpConfig = {
  stone: StoneConfig;
  experience: JumpExperienceConfig;
};

const config: JumpConfig = {
  stone: {
    width: 3,
    height: 0.2,
    initialVelocity: 5,
  },
  experience: {
    numberOfStones: 20,
  },
};

/**
 * Utility contants
 */

const stoneArgs: Triplet = [
  config.stone.width,
  config.stone.height,
  config.stone.width,
];

const halfNumberOfStones: number = config.experience.numberOfStones / 2;

const StoneMaterial = new MeshStandardMaterial({ color: "#19157d" });

/**
 * Store
 */

type JumpState = {
  prevStoneExists: boolean;
  getPrevStoneExists: () => boolean;
  setPrevStoneExists: (bool: boolean) => void;
};

const useJumpStore = create<JumpState>((set, get) => ({
  prevStoneExists: true,
  getPrevStoneExists: () => get().prevStoneExists,
  setPrevStoneExists: (bool: boolean) => set({ prevStoneExists: bool }),
}));

/**
 * Components
 */
const Stone = ({
  index,
  endRef,
}: {
  index: number;
  endRef: React.RefObject<Object3D<Event>>;
}) => {
  const getPrevStoneExists = useJumpStore((state) => state.getPrevStoneExists);
  const setPrevStoneExists = useJumpStore((state) => state.setPrevStoneExists);

  // Since [0, 0, 0] is the middle of the screen, we want to displace the
  // starting position by the following:
  const startingPosition = useMemo(
    () => config.stone.width * (index - halfNumberOfStones + 0.5),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [ref, api] = useBox(() => {
    const stoneConfig = config.stone;

    return {
      args: stoneArgs,
      position: [startingPosition, 0, 0],

      // The stones in the path shouldn't react to gravity or be affected by
      // the ball being on it.
      type: "Kinematic",

      velocity: [-stoneConfig.initialVelocity, 0, 0],

      // When it collides with the end it respawns
      onCollideBegin: (event: CollideEvent) => {
        if (event.body !== endRef.current) return;

        // Random roll to determine if the tile should respawn at the same level
        // or not.
        let visible = Math.random() >= 0.3;

        if (!getPrevStoneExists()) visible = true;
        setPrevStoneExists(visible);

        api.position.set(
          ((config.experience.numberOfStones - 1) / 2) * stoneConfig.width,
          visible ? 0 : 15,
          0
        );
      },
    };
  });

  useReset(() => {
    api.position.set(startingPosition, 0, 0);
  }, GAMES.JUMP);

  return (
    <mesh
      name={`Stone ${index}`}
      receiveShadow
      material={StoneMaterial}
      ref={ref}
    >
      <boxGeometry args={stoneArgs} />
    </mesh>
  );
};

const CobbleStones = () => {
  // This box just marks the end of the path, and intersects with the stones to
  // get them to respawn.
  const [endRef] = useBox(() => {
    return {
      args: [20, 0, 20],
      position: [-(halfNumberOfStones + 0.5) * config.stone.width, 10, 0],
      rotation: [Math.PI / 2, Math.PI / 2, 0],

      // This is set to dynamic so we can use the onCollision property on the
      // stones. Note that we give no mass here so that it will be unaffected
      // by gravity.
      type: "Dynamic",
    };
  });

  return (
    <group>
      {Array.from({ length: config.experience.numberOfStones }).map(
        (_, index) => (
          <Stone index={index + 1} key={index} endRef={endRef} />
        )
      )}
    </group>
  );
};

const JumpScene = ({ displacement }: { displacement: Vector3 }) => {
  const controls = useControls();
  useNet();

  return (
    <MiniScene name="Jump Scene" displacement={displacement}>
      <Ball
        game={GAMES.JUMP}
        name="Jump Ball"
        useFrameFn={(ref, api) => () => {
          const { shift } = controls.current;

          if (shift && ref.current?.matrix) {
            const y = ref.current.matrix.elements[13];

            if (y > 0.6 || y < 0.45) return;
            api.velocity.set(0, 7, 0);
          }
        }}
        position={[0.02, 0.75, 0]}
      />
      <CobbleStones />
      <Text
        color="#19157d"
        position={[0, 0.5, -config.stone.width / 2]}
        textProps={{ height: 1 }}
      >
        Shift to Jump
      </Text>
    </MiniScene>
  );
};

const Jump = ({ displacement }: { displacement: Vector3 }) => {
  const gameState = useStore((state) => state.state);
  const isInPlay = useStore((state) => state.gamesMap.JUMP);

  return (
    <Physics
      isPaused={!(gameState === GAME_STATE.PLAYING && isInPlay)}
      defaultContactMaterial={{ restitution: 0, friction: 0 }}
      gravity={[0, -15, 0]}
    >
      <JumpScene displacement={displacement} />
    </Physics>
  );
};

export default Jump;
