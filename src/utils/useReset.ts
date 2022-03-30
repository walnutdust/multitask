import { useEffect } from "react";
import useStore, { GAMES } from "../state/state";

const useReset = (callback: () => void, game: GAMES) => {
  const isInPlay = useStore((state) => state.gamesMap[game]);

  //eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, [isInPlay]);
};

export default useReset;
