import { Game } from "./Game";
import { Board } from "./Board";
import { Direction } from "./Direction";
import { Coordinates } from "./Coordinates";
import { GameState } from "./GameState";

function getSavedState(): GameState | undefined {
  if (window.location.hash) {
    return JSON.parse(atob(window.location.hash.substr(1)));
  }
}

const saved_state = getSavedState();

const slider: HTMLInputElement | null = document.querySelector("#myRange");
slider.value = saved_state?.size;
const SVG = document.getElementById("field");
let game = new Game(slider?.value);
let board = new Board(SVG, game.getState());
if (saved_state) game.applyState(saved_state);

function redraw() {
  const state = game.getState();
  board.redraw(state);
  window.location.hash = btoa(JSON.stringify(state));
}

document.addEventListener("keydown", function (event) {
  const direction = {
    ArrowRight: Direction.Right,
    ArrowLeft: Direction.Left,
    ArrowUp: Direction.Up,
    ArrowDown: Direction.Down,
  }[event.key];

  if (direction !== undefined) {
    game.move(direction);
    redraw();
  }
});

function onBoardClick(coordinates: Coordinates, tile_id?: number) {
  if (tile_id) {
    if (game.click(coordinates)) {
      redraw();
    } else {
      board.shakeTile(tile_id);
    }
  }
}
board.onClick = onBoardClick;

if (slider) {
  slider.onchange = function () {
    game = new Game(this.value);
    board = new Board(SVG, game.getState());
    board.onClick = onBoardClick;
    redraw();
  };
}

window.onhashchange = () => {
  const state = getSavedState();
  if (state) {
    game.applyState(state);
    redraw();
  }
};

board.redraw(game.getState());
