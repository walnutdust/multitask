import { useBox } from "@react-three/cannon";
import useStore from "../state/state";

/**
 * Hook to generate a "net" at the bottom of the scene to detect when the ball
 * goes out of bounds.
 */
const useNet = () => {
  const endGame = useStore((state) => state.api.endGame);

  return useBox(() => ({
    args: [400, 0.1, 400],
    position: [0, -10, 0],
    onCollide: () => endGame(),
    type: "Dynamic",
  }));
};

export default useNet;
