import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";

function useKeyControls(
  { current }: MutableRefObject<Record<GameControl, boolean>>,
  map: Record<KeyCode, GameControl>
) {
  useEffect(() => {
    const handleKeydown = ({ key }: KeyboardEvent) => {
      if (!isKeyCode(key)) return;
      current[map[key]] = true;
    };
    window.addEventListener("keydown", handleKeydown);
    const handleKeyup = ({ key }: KeyboardEvent) => {
      if (!isKeyCode(key)) return;
      current[map[key]] = false;
    };
    window.addEventListener("keyup", handleKeyup);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    };
  }, [current, map]);
}

const keyControlMap = {
  " ": "space",
  Shift: "shift",
  ArrowLeft: "left",
  ArrowRight: "right",
  a: "keyboardLeft",
  d: "keyboardRight",
  s: "keyboardDown",
  w: "keyboardUp",
  z: "keyboardUp",
  q: "keyboardLeft",
} as const;

type KeyCode = keyof typeof keyControlMap;
type GameControl = typeof keyControlMap[KeyCode];

const keyCodes = Object.keys(keyControlMap) as KeyCode[];
const isKeyCode = (v: unknown): v is KeyCode => keyCodes.includes(v as KeyCode);

export function useControls() {
  const controls = useRef<Record<GameControl, boolean>>({
    keyboardDown: false,
    keyboardUp: false,
    keyboardLeft: false,
    keyboardRight: false,
    left: false,
    right: false,
    space: false,
    shift: false,
  });

  useKeyControls(controls, keyControlMap);

  return controls;
}
