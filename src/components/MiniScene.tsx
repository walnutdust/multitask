import { Vector3 } from "three";

const MiniScene = ({
  children,
  name = "",
  directionalLightPosition = new Vector3(4, 5, 3),
  displacement = new Vector3(0, 0, 0),
}: {
  children?: JSX.Element[] | JSX.Element;
  name?: string;
  directionalLightPosition?: Vector3;
  displacement?: Vector3;
}) => {
  return (
    <scene name={name} userData={{ isMiniScene: true }} position={displacement}>
      <ambientLight intensity={0.25} />
      <directionalLight
        position={directionalLightPosition}
        intensity={0.7}
        castShadow
      />
      {children}
    </scene>
  );
};

export default MiniScene;
