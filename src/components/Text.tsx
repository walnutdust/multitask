import {
  extend,
  MeshPhysicalMaterialProps,
  MeshProps,
} from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import {
  TextGeometry,
  TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry";
import fontImport from "./optimer_bold.typeface.json";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import type { Triplet } from "@react-three/cannon";

extend({ TextGeometry });

const Text = ({
  children,
  position = [0, 0, 0],
  textProps = {},
  meshProps = {},
  ...props
}: {
  children: string;
  textProps?: Omit<TextGeometryParameters, "font">;
  position?: Triplet;
  meshProps?: MeshProps;
} & MeshPhysicalMaterialProps) => {
  const font = new FontLoader().parse(fontImport);

  const config: TextGeometryParameters = useMemo(
    () => ({
      size: 7,
      height: 3,
      font,

      ...textProps,
    }),
    [font, textProps]
  );

  const ref = useRef<TextGeometry>();

  useLayoutEffect(() => {
    ref.current?.center();
  }, [children, props]);

  return (
    <Suspense fallback={null}>
      <mesh {...meshProps} scale={[0.1, 0.1, 0.1]} position={position}>
        <textGeometry ref={ref} args={[children, config]} />
        <meshPhysicalMaterial {...props} />
      </mesh>
    </Suspense>
  );
};

export default Text;
