import { Game } from "./Game";
import { Board } from "./Board";
import { Direction } from "./Direction";
import { Coordinates } from "./Coordinates";
import { GameState } from "./GameState";

const slider = <HTMLInputElement>document.querySelector("#myRange");
const SVG = <SVGGraphicsElement>document.querySelector("#board");

function getSavedState(): GameState | undefined {
  if (window.location.hash) {
    return JSON.parse(atob(window.location.hash.substr(1)));
  }
}
const saved_state = getSavedState();

let game: Game;
if (saved_state) {
  slider.value = saved_state.size.toString();
  game = new Game(saved_state.size);
  game.applyState(saved_state);
} else {
  game = new Game(parseInt(slider.value));
}

let board = new Board(SVG, game.getState());
redraw();

if (!saved_state) startGame();

function startGame() {
  setTimeout(() => {
    game.shuffle();
    redraw();
  }, 1000);
}

function redraw() {
  const state = game.getState();
  board.redraw(state);
  window.location.hash = btoa(JSON.stringify(state));
}

document.addEventListener("keydown", function (event) {
  const directions: { [index: string]: Direction } = {
    ArrowRight: Direction.Right,
    ArrowLeft: Direction.Left,
    ArrowUp: Direction.Up,
    ArrowDown: Direction.Down,
  };

  const direction = directions[event.key];

  if (direction !== undefined) {
    game.move(direction);
    redraw();
  }
});

function onBoardClick(coordinates: Coordinates) {
  if (game.click(coordinates)) {
    redraw();
  } else {
    const tile_id = game.getTile(coordinates);
    if (tile_id) board.shakeTile(tile_id);
  }
}
board.onClick = onBoardClick;

if (slider) {
  slider.onchange = function () {
    game = new Game(parseInt(slider.value));
    board = new Board(SVG, game.getState());
    board.onClick = onBoardClick;
    redraw();
    startGame();
  };
}

window.onhashchange = () => {
  const state = getSavedState();
  if (state) {
    game.applyState(state);
    redraw();
  }
};
