import { Coordinates } from "./Coordinates";
import { Direction } from "./Direction";

export class Game {
  board: number[][] = [];
  private hole: Coordinates = { x: 0, y: 0 };

  constructor(private size: number) {
    this.fillDefaultState();
  }

  public fillDefaultState() {
    for (let x = 0; x < this.size; x++) {
      let row = [];

      for (let y = 0; y < this.size; y++) {
        row.push(x * this.size + y);
      }
      this.board.push(row);
    }
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
      [Direction.Down]: { x: -1, y: 0 },
      [Direction.Up]: { x: 1, y: 0 },
      [Direction.Right]: { x: 0, y: -1 },
      [Direction.Left]: { x: 0, y: 1 },
    }[direction];

    const tile_coordinates = {
      x: this.hole.x + direction_offset.x,
      y: this.hole.y + direction_offset.y,
    };

    return this.swapTiles(this.hole, tile_coordinates);
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
      return (this.board[coordinates.x][coordinates.y] = value);
    } else {
      return false;
    }
  }

  private getTile(coordinates: Coordinates) {
    if (this.isCoordsInField(coordinates)) {
      return this.board[coordinates.x][coordinates.y];
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
