import { Coordinates } from "./Coordinates";
import { GameState } from "./GameState";

export class Board {
  private tiles: SVGRectElement[] = [];
  public onClick: (
    coordinates: Coordinates,
    tile_id?: number
  ) => void = () => {};
  private size: number = 0;

  constructor(private svg: SVGGraphicsElement, state: GameState) {
    this.fill(state);
    svg.onclick = (e) => this.onBoardClick(e);
  }

  private fill(state: GameState) {
    this.clearSvg();
    this.size = state.size;
    state.board.forEach((row, y) =>
      row.forEach((value, x) => value && this.createTile(value, { x, y }))
    );
  }

  public redraw(state: GameState) {
    if (state.size !== this.size) {
      this.fill(state);
    } else {
      state.board.forEach((row, y) => {
        row.forEach(
          (value, x) => value && this.moveTile(this.tiles[value], { x, y })
        );
      });
    }
  }

  public shakeTile(tile_id: number) {
    this.tiles[tile_id].classList.add("shake");
    const endAnimation = () => {
      this.tiles[tile_id].removeEventListener(
        "webkitAnimationEnd",
        endAnimation
      );
      this.tiles[tile_id].removeEventListener("animationend", endAnimation);
      this.tiles[tile_id].classList.remove("shake");
    };
    this.tiles[tile_id].addEventListener("webkitAnimationEnd", endAnimation);
    this.tiles[tile_id].addEventListener("animationend", endAnimation);
  }

  private createTile(id: number, coordinates: Coordinates): SVGRectElement {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    Object.entries(this.getDefaultTileAttributes()).forEach(([attr, value]) =>
      rect.setAttribute(attr, value.toString())
    );
    this.assignImage(rect, id);
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
    };
  }

  private clearSvg() {
    const patterns = this.svg.querySelector("defs g");
    if (patterns) patterns.innerHTML = "";
    const tiles = this.svg.querySelectorAll(".tile");
    if (tiles) tiles.forEach((e) => e.remove());
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
    const board = this.svg.getBoundingClientRect();
    const tile_id = this.tiles.indexOf(<SVGRectElement>e.target);
    this.onClick(
      {
        x: Math.trunc((e.clientX - board.left) / tile_size.width),
        y: Math.trunc((e.clientY - board.top) / tile_size.height),
      },
      tile_id > 0 ? tile_id : undefined
    );
  }

  public assignImage(tile: SVGRectElement, tile_id: number) {
    const tile_size = this.getTileSize();

    const pattern = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "pattern"
    );
    const pattern_id = `pat${tile_id}`;
    Object.entries({
      width: 1,
      height: 1,
      id: pattern_id,
    }).forEach(([attr, value]) => pattern.setAttribute(attr, value.toString()));
    const image = document.createElementNS("http://www.w3.org/2000/svg", "use");
    Object.entries({
      href: `#image`,
      x: -1 * (tile_id % this.size) * tile_size.width,
      y: -1 * Math.trunc(tile_id / this.size) * tile_size.height,
    }).forEach(([attr, value]) => image.setAttribute(attr, value.toString()));
    pattern.appendChild(image);
    this.svg.querySelector("defs g")?.appendChild(pattern);
    tile.setAttribute("fill", `url(#${pattern_id})`);
  }

  private getTileSize() {
    const view_box_size = this.svg.getBoundingClientRect();

    return {
      width: view_box_size.width / this.size,
      height: view_box_size.height / this.size,
    };
  }
}
