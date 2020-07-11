import { Coordinates } from "./Coordinates";
import { Direction } from "./Direction";
import { GameState } from "./GameState";

export class Game {
  private board: number[][] = [];
  private hole: Coordinates = { x: 0, y: 0 };

  constructor(private size: number) {
    for (let x = 0; x < this.size; x++) {
      let row = [];

      for (let y = 0; y < this.size; y++) {
        row.push(x * this.size + y);
      }
      this.board.push(row);
    }
  }

  public applyState(state: GameState) {
    this.board = state.board;
    this.size = state.size;
    const hole = this.getHoleCoordinates();
    if (hole) this.hole = hole;
  }

  public getState(): GameState {
    return {
      board: this.board,
      size: this.size,
    };
  }

  public shuffle() {
    const allowed_directions = [
      Direction.Right,
      Direction.Left,
      Direction.Up,
      Direction.Down,
    ];

    for (let i = 0; i < 1000; i++) {
      this.move(
        allowed_directions[
          Math.floor(Math.random() * allowed_directions.length)
        ]
      );
    }
  }

  public move(direction: Direction) {
    const direction_offset = {
      [Direction.Down]: { x: 0, y: -1 },
      [Direction.Up]: { x: 0, y: 1 },
      [Direction.Right]: { x: -1, y: 0 },
      [Direction.Left]: { x: 1, y: 0 },
    }[direction];

    const tile_coordinates = {
      x: this.hole.x + direction_offset.x,
      y: this.hole.y + direction_offset.y,
    };

    return this.swapTiles(this.hole, tile_coordinates);
  }

  public click(coordinates: Coordinates) {
    const directions = [
      { x: 0, y: 1, direction: Direction.Down },
      { x: 0, y: -1, direction: Direction.Up },
      { x: 1, y: 0, direction: Direction.Right },
      { x: -1, y: 0, direction: Direction.Left },
    ];

    const offset = {
      x: this.hole.x - coordinates.x,
      y: this.hole.y - coordinates.y,
    };

    const direction = directions.find(
      (direction) => direction.x === offset.x && direction.y === offset.y
    )?.direction;

    if (direction === undefined) return false;

    return this.move(direction);
  }

  private getHoleCoordinates() {
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        if (this.board[y][x] == 0) return { x, y };
      }
    }
  }

  private swapTiles(from: Coordinates, to: Coordinates) {
    const from_tile_number = this.getTile(from);
    const to_tile_number = this.getTile(to);

    if (from_tile_number !== undefined && to_tile_number !== undefined) {
      this.setTile(to, from_tile_number);
      this.setTile(from, to_tile_number);

      if (from_tile_number === 0) this.hole = to;
      if (to_tile_number === 0) this.hole = from;

      return true;
    } else {
      return false;
    }
  }

  private setTile(coordinates: Coordinates, value: number) {
    if (this.isCoordsInField(coordinates)) {
      return (this.board[coordinates.y][coordinates.x] = value);
    } else {
      return false;
    }
  }

  private getTile(coordinates: Coordinates) {
    if (this.isCoordsInField(coordinates)) {
      return this.board[coordinates.y][coordinates.x];
    }
  }

  private isCoordsInField(coordinates: Coordinates) {
    return (
      coordinates.x >= 0 &&
      coordinates.x < this.size &&
      coordinates.y >= 0 &&
      coordinates.y < this.size
    );
  }
}
