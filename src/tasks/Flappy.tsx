import {
  Physics,
  useBox,
  useCompoundBody,
  CollideEvent,
} from "@react-three/cannon";
import { MeshStandardMaterial, BoxGeometry } from "three";

import type { Triplet } from "@react-three/cannon";
import type { Vector3, Event, Object3D } from "three";

import { useControls } from "../utils/useControls";
import useStore, { GAMES, GAME_STATE } from "../state/state";
import MiniScene from "../components/MiniScene";
import Ball from "../components/Ball";
import Text from "../components/Text";
import useNet from "../utils/useNet";
import { useEffect } from "react";

/**
 * Flappy game configuration.
 */

type ColumnConfig = {
  width: number;
  height: number;
  initialVelocity: number;
  gap: number;
};

type JumpExperienceConfig = {
  numberOfColumns: number;
  gapBetweenColumns: number;
  jumpImpulse: number;
};

type FlappyConfig = {
  column: ColumnConfig;
  experience: JumpExperienceConfig;
};

const config: FlappyConfig = {
  column: {
    width: 3,
    height: 30,
    initialVelocity: 5,
    gap: 5,
  },
  experience: {
    numberOfColumns: 6,
    gapBetweenColumns: 10,
    jumpImpulse: 0.7,
  },
};

/**
 * Utility contants
 */

const columnArgs: Triplet = [
  config.column.width,
  config.column.height,
  config.column.width,
];

const columnMaterial = new MeshStandardMaterial({ color: "#135200" });
const columnGeometry = new BoxGeometry(
  config.column.width,
  config.column.height,
  config.column.width
);

const spaceBetweenColumnCenters =
  config.column.width + config.experience.gapBetweenColumns;

/**
 * Components
 */
const Column = ({
  index,
  endRef,
}: {
  index: number;
  endRef: React.RefObject<Object3D<Event>>;
}) => {
  const isInPlay = useStore((state) => state.gamesMap.FLAPPY);

  const [colRef, colAPI] = useCompoundBody(() => ({
    velocity: [-config.column.initialVelocity, 0, 0],
    shapes: [
      {
        args: columnArgs,
        position: [0, config.column.height / 2 + config.column.gap, 0],
        type: "Box",
      },
      {
        args: columnArgs,
        position: [0, -(config.column.height / 2 + config.column.gap), 0],
        type: "Box",
      },
    ],
    onCollide: (event: CollideEvent) => {
      if (event.body !== endRef.current) return;
      const contactPoint = event.contact.contactPoint;

      colAPI.position.set(
        contactPoint[0] +
          config.experience.numberOfColumns * spaceBetweenColumnCenters +
          config.column.width / 2,
        (Math.random() - 0.5) * config.column.gap * 2,
        contactPoint[2]
      );
    },
    type: "Kinematic",
  }));

  useEffect(() => {
    if (!isInPlay) {
      colAPI.position.set(
        spaceBetweenColumnCenters *
          (index - config.experience.numberOfColumns / 2),
        0,
        0
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInPlay]);

  return (
    <group ref={colRef} name={`Stone ${index}`}>
      <mesh
        position={[0, config.column.height / 2 + config.column.gap, 0]}
        name={`Stone ${index} top`}
        material={columnMaterial}
        geometry={columnGeometry}
      />
      <mesh
        position={[0, -(config.column.height / 2 + config.column.gap), 0]}
        name={`Stone ${index} bottom`}
        material={columnMaterial}
        geometry={columnGeometry}
        receiveShadow
      />
    </group>
  );
};

const Columns = () => {
  const [endRef] = useBox(() => {
    return {
      args: [0.01, 20, 0.01],
      position: [
        -(config.experience.numberOfColumns * spaceBetweenColumnCenters) / 2,
        10,
        0,
      ],
      type: "Dynamic",
    };
  });

  return (
    <group>
      {Array.from({ length: config.experience.numberOfColumns }).map(
        (_, index) => (
          <Column index={index} key={index} endRef={endRef} />
        )
      )}
    </group>
  );
};

const Flappy = ({ displacement }: { displacement: Vector3 }) => {
  const endGame = useStore((state) => state.api.endGame);
  useNet();
  const controls = useControls();

  return (
    <MiniScene displacement={displacement}>
      <Ball
        game={GAMES.FLAPPY}
        position={[0, 0.5, 0]}
        onCollide={() => endGame()}
        name="Flappy ball"
        useFrameFn={(ref, api) => () => {
          const { space } = controls.current;

          if (space && ref.current?.matrix) {
            api.applyLocalImpulse(
              [0, config.experience.jumpImpulse, 0],
              [0, 0, 0]
            );
          }
        }}
        appendElement={
          <Text color="#52c41a" textProps={{ size: 15 }} position={[0, -3, 0]}>
            {"Space\nto Fly"}
          </Text>
        }
      />
      <Columns />
    </MiniScene>
  );
};

const FlappyScene = ({ displacement }: { displacement: Vector3 }) => {
  const gameState = useStore((state) => state.state);
  const isInPlay = useStore((state) => state.gamesMap.FLAPPY);

  return (
    <Physics
      isPaused={!(gameState === GAME_STATE.PLAYING && isInPlay)}
      defaultContactMaterial={{ restitution: 0, friction: 0 }}
    >
      <Flappy displacement={displacement} />
    </Physics>
  );
};

export default FlappyScene;
