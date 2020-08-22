'use strict';

var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Right"] = 2] = "Right";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));

class Game {
    constructor(size) {
        this.size = size;
        this.board = [];
        this.hole = { x: 0, y: 0 };
        for (let x = 0; x < this.size; x++) {
            let row = [];
            for (let y = 0; y < this.size; y++) {
                row.push(x * this.size + y);
            }
            this.board.push(row);
        }
    }
    applyState(state) {
        this.board = state.board;
        this.size = state.size;
        const hole = this.getHoleCoordinates();
        if (hole)
            this.hole = hole;
    }
    getState() {
        return {
            board: this.board,
            size: this.size,
        };
    }
    shuffle() {
        const allowed_directions = [
            Direction.Right,
            Direction.Left,
            Direction.Up,
            Direction.Down,
        ];
        for (let i = 0; i < 1000; i++) {
            this.move(allowed_directions[Math.floor(Math.random() * allowed_directions.length)]);
        }
    }
    move(direction) {
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
    click(coordinates) {
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
        const direction = directions.find((direction) => direction.x === offset.x && direction.y === offset.y)?.direction;
        if (direction === undefined)
            return false;
        return this.move(direction);
    }
    getHoleCoordinates() {
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x] == 0)
                    return { x, y };
            }
        }
    }
    swapTiles(from, to) {
        const from_tile_number = this.getTile(from);
        const to_tile_number = this.getTile(to);
        if (from_tile_number !== undefined && to_tile_number !== undefined) {
            this.setTile(to, from_tile_number);
            this.setTile(from, to_tile_number);
            if (from_tile_number === 0)
                this.hole = to;
            if (to_tile_number === 0)
                this.hole = from;
            return true;
        }
        else {
            return false;
        }
    }
    setTile(coordinates, value) {
        if (this.isCoordsInField(coordinates)) {
            return (this.board[coordinates.y][coordinates.x] = value);
        }
        else {
            return false;
        }
    }
    getTile(coordinates) {
        if (this.isCoordsInField(coordinates)) {
            return this.board[coordinates.y][coordinates.x];
        }
    }
    isCoordsInField(coordinates) {
        return (coordinates.x >= 0 &&
            coordinates.x < this.size &&
            coordinates.y >= 0 &&
            coordinates.y < this.size);
    }
}

class Board {
    constructor(svg, state) {
        this.svg = svg;
        this.tiles = [];
        this.onClick = () => { };
        this.size = 0;
        this.fill(state);
        svg.onclick = (e) => this.onBoardClick(e);
    }
    fill(state) {
        this.clearSvg();
        this.size = state.size;
        state.board.forEach((row, y) => row.forEach((value, x) => value && this.createTile(value, { x, y })));
    }
    redraw(state) {
        if (state.size !== this.size) {
            this.fill(state);
        }
        else {
            state.board.forEach((row, y) => {
                row.forEach((value, x) => value && this.moveTile(this.tiles[value], { x, y }));
            });
        }
    }
    shakeTile(tile_id) {
        this.tiles[tile_id].classList.add("is-shaked");
        const endAnimation = () => {
            this.tiles[tile_id].removeEventListener("webkitAnimationEnd", endAnimation);
            this.tiles[tile_id].removeEventListener("animationend", endAnimation);
            this.tiles[tile_id].classList.remove("is-shaked");
        };
        this.tiles[tile_id].addEventListener("webkitAnimationEnd", endAnimation);
        this.tiles[tile_id].addEventListener("animationend", endAnimation);
    }
    createTile(id, coordinates) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        Object.entries(this.getDefaultTileAttributes()).forEach(([attr, value]) => rect.setAttribute(attr, value.toString()));
        this.assignImage(rect, id);
        this.moveTile(rect, coordinates);
        this.svg.appendChild(rect);
        this.tiles[id] = rect;
        return this.tiles[id];
    }
    getDefaultTileAttributes() {
        const tile_size = this.getTileSize();
        return {
            width: tile_size.width,
            height: tile_size.height,
            class: "tile",
            rx: 3,
            ry: 3,
        };
    }
    clearSvg() {
        const patterns = this.svg.querySelector("defs g");
        if (patterns)
            patterns.innerHTML = "";
        const tiles = this.svg.querySelectorAll(".tile");
        if (tiles)
            tiles.forEach((e) => e.remove());
    }
    moveTile(tile, coordinates) {
        const tile_size = this.getTileSize();
        Object.entries({
            x: coordinates.x * tile_size.width,
            y: coordinates.y * tile_size.height,
        }).forEach(([axis, value]) => tile.setAttribute(axis, value.toString()));
    }
    onBoardClick(e) {
        const tile_size = this.getTileSize();
        const board = this.svg.getBoundingClientRect();
        this.onClick({
            x: Math.trunc((e.clientX - board.left) / tile_size.width),
            y: Math.trunc((e.clientY - board.top) / tile_size.height),
        });
    }
    assignImage(tile, tile_id) {
        const tile_size = this.getTileSize();
        const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
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
    getTileSize() {
        const view_box_size = this.svg.getBoundingClientRect();
        return {
            width: view_box_size.width / this.size,
            height: view_box_size.height / this.size,
        };
    }
}

const slider = document.querySelector("#myRange");
const SVG = document.querySelector("#board");
function getSavedState() {
    if (window.location.hash) {
        return JSON.parse(atob(window.location.hash.substr(1)));
    }
}
const saved_state = getSavedState();
let game;
if (saved_state) {
    slider.value = saved_state.size.toString();
    game = new Game(saved_state.size);
    game.applyState(saved_state);
}
else {
    game = new Game(parseInt(slider.value));
}
let board = new Board(SVG, game.getState());
redraw();
if (!saved_state)
    startGame();
function startGame() {
    setTimeout(() => {
        game.shuffle();
        redraw();
    }, 1000);
}
function redraw() {
    const state = game.getState();
    board.redraw(state);
    window.location.hash = btoa(JSON.stringify(state));
}
document.addEventListener("keydown", function (event) {
    const directions = {
        ArrowRight: Direction.Right,
        ArrowLeft: Direction.Left,
        ArrowUp: Direction.Up,
        ArrowDown: Direction.Down,
    };
    const direction = directions[event.key];
    if (direction !== undefined) {
        game.move(direction);
        redraw();
    }
});
function onBoardClick(coordinates) {
    if (game.click(coordinates)) {
        redraw();
    }
    else {
        const tile_id = game.getTile(coordinates);
        if (tile_id)
            board.shakeTile(tile_id);
    }
}
board.onClick = onBoardClick;
if (slider) {
    slider.onchange = function () {
        game = new Game(parseInt(slider.value));
        board = new Board(SVG, game.getState());
        board.onClick = onBoardClick;
        redraw();
        startGame();
    };
}
window.onhashchange = () => {
    const state = getSavedState();
    if (state) {
        game.applyState(state);
        redraw();
    }
};
