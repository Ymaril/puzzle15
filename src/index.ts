import { Game } from "./Game";
import { Board } from "./Board";
import { Direction } from "./Direction";
import { Coordinates } from "./Coordinates";

const SVG = document.getElementById("field");
const game = new Game(6);
const board = new Board(SVG, 6, game.board);
board.assignImage("image");

document.addEventListener("keydown", function (event) {
  const direction = {
    ArrowRight: Direction.Right,
    ArrowLeft: Direction.Left,
    ArrowUp: Direction.Up,
    ArrowDown: Direction.Down,
  }[event.key];

  if(direction !== undefined) {
    game.move(direction);
    board.redraw(game.board);
  }
});

board.onClick = (coordinates: Coordinates) => {
  game.click(coordinates);
  board.redraw(game.board);
};

game.move(Direction.Left);
board.redraw(game.board);
