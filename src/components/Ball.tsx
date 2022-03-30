import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import type { PublicApi, Triplet, CollideEvent } from "@react-three/cannon";
import type { Object3D, Event } from "three";
import { ReactNode } from "react";
import useReset from "../utils/useReset";
import { GAMES } from "../state/state";

const Ball = ({
  args = [0.5, 32, 32],
  name = "",
  position = [0, 0.5, 0],
  useFrameFn = () => () => null,
  onCollide = () => null,
  appendElement = null,
  game,
}: {
  args?: Triplet;
  name?: string;
  position?: Triplet;
  useFrameFn?: (
    ref: React.RefObject<Object3D<Event>>,
    api: PublicApi
  ) => () => void;
  onCollide?: (event: CollideEvent) => void;
  appendElement?: ReactNode | null;
  game: GAMES;
}) => {
  const [ref, api] = useSphere(() => ({
    args: [args[0]],
    mass: 0.5,
    position: position,
    onCollide,
  }));

  useFrame(useFrameFn(ref, api));
  useReset(() => {
    api.position.set(position[0], position[1], position[2]);
    api.velocity.set(0, 0, 0);
    api.angularVelocity.set(0, 0, 0);
  }, game);

  return (
    <mesh name={name} ref={ref} castShadow>
      <sphereGeometry args={args} />
      <meshStandardMaterial color="#bbb" metalness={0.2} roughness={0.2} />
      {appendElement}
    </mesh>
  );
};

export default Ball;
