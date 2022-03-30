import { Vector4 } from "three";
import { getViewportArgsForAllViews } from "./view";

// Note that Jest globals have default screen of 1024 x 768

const WIDTH = 1024;
const HEIGHT = 768;

test("Empty array", () => {
  expect(getViewportArgsForAllViews(0)).toEqual([
    new Vector4(WIDTH, 0, WIDTH, HEIGHT),
  ]);
});

test("1 element", () => {
  expect(getViewportArgsForAllViews(1)).toEqual([
    new Vector4(0, 0, WIDTH, HEIGHT),
    new Vector4(0, HEIGHT, WIDTH, HEIGHT),
  ]);
});

test("2 elements", () => {
  expect(getViewportArgsForAllViews(2)).toEqual([
    new Vector4(0, 0, WIDTH, HEIGHT / 2),
    new Vector4(0, HEIGHT / 2, WIDTH, HEIGHT / 2),
    new Vector4(WIDTH, 0, WIDTH, HEIGHT),
  ]);
});

test("3 elements", () => {
  expect(getViewportArgsForAllViews(3)).toEqual([
    new Vector4(0, 0, WIDTH / 2, HEIGHT / 2),
    new Vector4(0, HEIGHT / 2, WIDTH / 2, HEIGHT / 2),
    new Vector4(WIDTH / 2, 0, WIDTH / 2, HEIGHT),
    new Vector4(WIDTH / 2, HEIGHT, WIDTH / 2, HEIGHT / 2),
  ]);
});

test("4 elements", () => {
  expect(getViewportArgsForAllViews(4)).toEqual([
    new Vector4(0, 0, WIDTH / 2, HEIGHT / 2),
    new Vector4(0, HEIGHT / 2, WIDTH / 2, HEIGHT / 2),
    new Vector4(WIDTH / 2, 0, WIDTH / 2, HEIGHT / 2),
    new Vector4(WIDTH / 2, HEIGHT / 2, WIDTH / 2, HEIGHT / 2),
    new Vector4(WIDTH, 0, WIDTH / 2, HEIGHT),
  ]);
});
