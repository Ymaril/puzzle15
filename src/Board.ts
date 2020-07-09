import { Coordinates } from "./Coordinates";

export class Board {
  private tiles: SVGRectElement[] = [];
  public onClick: (coordinates: Coordinates) => void = () => {};

  constructor(
    private svg: SVGGraphicsElement,
    private size: number,
    state: number[][]
  ) {
    state.forEach((row, y) =>
      row.forEach((value, x) => value && this.createTile(value, { x, y }))
    );
    svg.onclick = (e) => this.onBoardClick(e);
  }

  public redraw(state: number[][]) {
    state.forEach((row, y) => {
      row.forEach(
        (value, x) => value && this.moveTile(this.tiles[value], { x, y })
      );
    });
  }

  private createTile(id: number, coordinates: Coordinates): SVGRectElement {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    Object.entries(this.getDefaultTileAttributes()).forEach(([attr, value]) =>
      rect.setAttribute(attr, value.toString())
    );
    this.moveTile(rect, coordinates);
    this.svg.appendChild(rect);
    this.tiles[id] = rect;
    return this.tiles[id];
  }

  private getDefaultTileAttributes() {
    const tile_size = this.getTileSize();

    return {
      width: tile_size.width,
      height: tile_size.height,
      class: "tile",
      stroke: "#000",
      "stroke-width": "2px",
    };
  }

  private moveTile(tile: SVGRectElement, coordinates: Coordinates) {
    const tile_size = this.getTileSize();

    Object.entries({
      x: coordinates.x * tile_size.width,
      y: coordinates.y * tile_size.height,
    }).forEach(([axis, value]) => tile.setAttribute(axis, value.toString()));
  }

  private onBoardClick(e: MouseEvent) {
    const tile_size = this.getTileSize();
    this.onClick({
      x: Math.trunc(e.offsetX / tile_size.width),
      y: Math.trunc(e.offsetY / tile_size.height),
    });
  }

  public assignImage(id: string) {
    this.tiles.forEach((tile, tile_id) => {
      const pattern = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "pattern"
      );
      const pattern_id = `pat${tile_id}`;
      Object.entries({
        width: 1,
        height: 1,
        id: pattern_id,
      }).forEach(([attr, value]) =>
        pattern.setAttribute(attr, value.toString())
      );
      const image = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "use"
      );
      Object.entries({
        href: `#${id}`,
        x: -1 * tile.x.baseVal.value,
        y: -1 * tile.y.baseVal.value,
      }).forEach(([attr, value]) => image.setAttribute(attr, value.toString()));
      pattern.appendChild(image);
      this.svg.querySelector("defs")?.appendChild(pattern);
      tile.setAttribute("fill", `url(#${pattern_id})`);
    });
  }

  private getTileSize() {
    const view_box_size = this.svg.getBoundingClientRect();

    return {
      width: view_box_size.width / this.size,
      height: view_box_size.height / this.size,
    };
  }
}
