import { Coordinates } from "./Coordinates";

export class Board {
  private tiles: SVGRectElement[] = [];
  public onClick: (coordinates: Coordinates) => void = () => {};

  constructor(
    private svg: SVGGraphicsElement,
    private size: number,
    state: number[][]
  ) {
    state.forEach((row, y) => {
      row.forEach((value, x) => this.createTile(value, { x, y }));
    });

    svg.onclick = (e) => {
      const tile_size = this.getTileSize();
      this.onClick({
        x: Math.trunc(e.offsetX / tile_size.width),
        y: Math.trunc(e.offsetY / tile_size.height),
      });
    };
  }

  public draw(state: number[][]) {
    state.forEach((row, y) => {
      row.forEach((value, x) => this.moveTile(value, { x, y }));
    });
  }

  private createTile(id: number, coordinates: Coordinates): SVGRectElement {
    const rect = (this.tiles[id] = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    ));
    const tile_size = this.getTileSize();
    Object.entries({
      x: coordinates.x * tile_size.width,
      y: coordinates.y * tile_size.height,
      width: tile_size.width,
      height: tile_size.height,
      class: "tile",
      fill: "none",
      stroke: "#000",
      "stroke-width": "2px",
    }).forEach(([attr, value]) => rect.setAttribute(attr, value.toString()));
    this.svg.appendChild(rect);
    return rect;
  }

  private moveTile(id: number, coordinates: Coordinates) {
    const tile_size = this.getTileSize();

    Object.entries({
      x: coordinates.x * tile_size.width,
      y: coordinates.y * tile_size.height,
    }).forEach(([axis, value]) =>
      this.tiles[id].setAttribute(axis, value.toString())
    );
  }

  private getTileSize() {
    const view_box_size = this.svg.getBoundingClientRect();

    return {
      width: view_box_size.width / this.size,
      height: view_box_size.height / this.size,
    };
  }
}
