import { useBox } from "@react-three/cannon";
import { Vector3 } from "three";
import useStore from "../state/state";

/**
 * Hook to generate a "net" at the bottom of the scene to detect when the ball
 * goes out of bounds.
 *
 * @param displacement displacement of the scene
 */
const useNet = (displacement: Vector3) => {
  const endGame = useStore((state) => state.api.endGame);

  return useBox(() => ({
    args: [400, 0.1, 400],
    position: [displacement.x, displacement.y - 10, displacement.z],
    onCollide: (event) => {
      console.log(event);
      endGame();
    },
  }));
};

export default useNet;
