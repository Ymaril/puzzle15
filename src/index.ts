import { Game } from "./Game";
import { Board } from "./Board";
import { Direction } from "./Direction";

const SVG = document.getElementById("field");
const game = new Game(4);
const board = new Board(SVG, 4, game.field);

game.move(Direction.Left);
board.draw(game.field);
