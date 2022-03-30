import { useFrame } from "@react-three/fiber";
import {
  useBox,
  useCylinder,
  useHingeConstraint,
  Triplet,
  CylinderArgs,
  Physics,
} from "@react-three/cannon";
import { Vector3 } from "three";
import { Suspense } from "react";

import { useControls } from "../utils/useControls";
import useStore, { GAMES, GAME_STATE } from "../state/state";
import MiniScene from "../components/MiniScene";
import Ball from "../components/Ball";
import Text from "../components/Text";
import useNet from "../utils/useNet";
import useReset from "../utils/useReset";

/**
 * Constants
 */

const TORQUE: number = 150; // How much the user controls affect the beam.

/**
 * Classes
 */

const Beam = ({
  args = [8, 0.5, 1],
  cylinderArgs = [0.1, 0.1, 0.8, 6],
}: {
  args?: Triplet;
  cylinderArgs?: CylinderArgs;
}) => {
  const [ref, api] = useBox(() => ({
    args,
    mass: 10,
    position: [0, 0, 0],
    type: "Dynamic",
  }));

  const [cylinderRef] = useCylinder(() => ({
    args: cylinderArgs,
    type: "Static",
    position: [0, 0, 0],
    rotation: [Math.PI / 2, 0, 0],
  }));

  useHingeConstraint(ref, cylinderRef, {
    pivotA: [0, 0, 0],
    axisA: [0, 0, 1],
    pivotB: [0, 0, 0],
    axisB: [0, 1, 0],
  });

  const controls = useControls();

  useFrame(() => {
    const { left, right } = controls.current;

    if (left) api.applyTorque([0, 0, TORQUE]);
    if (right) api.applyTorque([0, 0, -TORQUE]);
  });

  useReset(() => {
    api.rotation.set(0, 0, 0);
    api.angularVelocity.set(0, 0, 0);
  }, GAMES.BALANCE);

  return (
    <mesh ref={ref} receiveShadow name="Beam">
      <boxGeometry args={args} />
      <meshStandardMaterial color="#cc3329" metalness={0.4} roughness={1} />
      <Suspense fallback={null}>
        <Text color="#a8071a" position={[0, -1.2, 0.5]}>
          {"Left / Right\n to Balance"}
        </Text>
      </Suspense>
    </mesh>
  );
};

const BalanceScene = ({ displacement }: { displacement: Vector3 }) => {
  useNet(displacement);

  return (
    <MiniScene name="Balance Scene" displacement={displacement}>
      <Ball
        game={GAMES.BALANCE}
        position={[0.02, 0.75, 0]}
        name="Balance Ball"
      />
      <Beam />
    </MiniScene>
  );
};

const Balance = ({ displacement }: { displacement: Vector3 }) => {
  const gameState = useStore((state) => state.state);
  const isInPlay = useStore((state) => state.gamesMap.BALANCE);

  return (
    <Physics
      isPaused={!(gameState === GAME_STATE.PLAYING && isInPlay)}
      gravity={[0, -4, 0]}
      defaultContactMaterial={{ restitution: 0, friction: 0 }}
    >
      <BalanceScene displacement={displacement} />
    </Physics>
  );
};

export default Balance;
