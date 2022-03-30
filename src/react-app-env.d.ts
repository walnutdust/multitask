/// <reference types="react-scripts" />

import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      textGeometry: ReactThreeFiber.Node<TextGeometry, typeof TextGeometry>;
    }
  }
}
