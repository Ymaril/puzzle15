import { Game } from "./Game";
import { Board } from "./Board";
import { Direction } from "./Direction";
import { Coordinates } from "./Coordinates";

function getSavedState() {
  if (window.location.hash) {
    return JSON.parse(atob(window.location.hash.substr(1)));
  }
}

const saved_state = getSavedState();

const slider:HTMLInputElement | null = document.querySelector('#myRange');
slider.value = saved_state.size;
const SVG = document.getElementById("field");
let game = new Game(saved_state?.size || slider?.value);
let board = new Board(SVG, game.size, game.board);
board.assignImage("image");
if (saved_state) game.applyState(saved_state.board);

function redraw() {
  board.redraw(game.board);
  window.location.hash = btoa(
    JSON.stringify({ size: game.size, board: game.board })
  );
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

board.onClick = (coordinates: Coordinates) => {
  game.click(coordinates);
  redraw();
};

if(slider) {
  slider.onchange = function () {
    game = new Game(this.value);
    board = new Board(SVG, game.size, game.board);
    board.assignImage("image");
    redraw();
  };
}

window.onhashchange = () => {
  const state = getSavedState();
  if (state) {
    game.applyState(getSavedState().board);
    redraw();
  }
};

board.redraw(game.board);
