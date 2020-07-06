interface Coordinates {
  x: number,
  y: number
}

const enum Direction {
  Up,
  Down,
  Right,
  Left
}

export class Game {
  field: number[][] = [];
  private hole: Coordinates = {x: 0, y: 0};

  constructor(private size: number) {
    this.fillDefaultState();
  }

  public fillDefaultState() {
    for(let x = 0; x < this.size; x++) {
      let row = [];

      for(let y = 0; y < this.size; y++) { row.push(x * this.size + y); }
      this.field.push(row);
    }
  }

  public move(direction: Direction) {
    const direction_offset = {
      [Direction.Down]: {x: 0, y: -1},
      [Direction.Up]: {x: 0, y: 1},
      [Direction.Right]: {x: -1, y: 0},
      [Direction.Left]: {x: 1, y: 0}
    }[direction];

    const tile_coordinates = {
      x: this.hole.x + direction_offset.x,
      y: this.hole.y + direction_offset.y
    };

    return this.changeTiles(this.hole, tile_coordinates);
  }

  private changeTiles(from: Coordinates, to: Coordinates) {
    const from_tile_number = this.getTile(from);
    const to_tile_number = this.getTile(to);

    if(from_tile_number !== undefined && to_tile_number !== undefined) {
      this.setTile(to, from_tile_number);
      this.setTile(from, to_tile_number);

      if(from_tile_number === 0) this.hole = to;
      if(to_tile_number === 0) this.hole = from;

      return true;
    } else { return false; }
  }

  private setTile(coordinates: Coordinates, value: number) {
    if(this.isCoordsInField(coordinates)) {
      this.field[coordinates.x][coordinates.y] = value;
      return this.field[coordinates.x][coordinates.y];
    } else { return false; }
  }

  private getTile(coordinates: Coordinates) {
    if(this.isCoordsInField(coordinates)) {
      return this.field[coordinates.x][coordinates.y];
    }
  }

  private isCoordsInField(coordinates: Coordinates) {
    return coordinates.x >= 0 && coordinates.x < this.size &&
      coordinates.y >= 0 && coordinates.y < this.size;
  }
}