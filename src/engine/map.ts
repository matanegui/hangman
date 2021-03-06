const TILE_SIZE: number = 8;
const WORLD_WIDTH: number = 8;
const LEVEL_WIDTH: number = 30;
const LEVEL_HEIGHT: number = 18;
const MAP_Y_OFFSET: number = 8;

/* TILE */
interface Tile {
    id: number;
    flags: boolean[];
    box: { x, y, w, h }
}

const create_tile: (id: number, flags?: number[], box?: { x: number, y: number, w: number, h: number }) => Tile = (id, flags = [], box = { x: 0, y: 0, w: 0, h: 0 }) => ({
    id,
    box,
    flags: flags.reduce((accumulator: boolean[], flag: number) => {
        accumulator[flag] = true;
        return accumulator;
    }, [])
});

/* TILESET */
interface Tileset {
    flags: number[][]
    spawners: ((id: number, x: number, y: number) => Entity)[][],
    add_tiles_flag: (flag: number, tiles: number[]) => void,
    add_tile_spawner: (id: number, spawner: (id: number, x: number, y: number) => Entity) => void

}

const create_tileset: () => Tileset = () => {

    function add_tiles_flag(flag: number, tiles: number[]): void {
        tiles.forEach((tile_id: number) => {
            if (!this.flags[tile_id]) {
                this.flags[tile_id] = [flag];
            } else {
                this.flags[tile_id].push(flag);
            }
        })
    }

    function add_tile_spawner(id: number, spawner: (id: number, x: number, y: number) => Entity): void {
        this.spawners[id] ? this.spawners[id].push(spawner) : this.spawners[id] = [spawner];
    }

    return {
        flags: [],
        spawners: [],
        add_tiles_flag,
        add_tile_spawner
    }
};

/* TILEMAP */

interface TilemapData {
    map_x: number;
    map_y: number;
    width: number;
    height: number;
    tileset: Tileset;
    remap: (tile_id: number) => number,
    spawn: (tilemap: Tilemap) => Entity[],
    get_tile: (x: number, y: number) => Tile,
    get_tiles_in_rect: (x: number, y: number, w: number, h: number) => Tile[]
}

type Tilemap = Entity & TilemapData;

const create_tilemap: (x: number, y: number, map_x: number, map_y: number, tileset: Tileset, remap?: (tile_id: number) => number) => Tilemap = (x, y, map_x, map_y, tileset, remap) => {

    function draw(): void {
        map(this.map_x, this.map_y, this.width, this.height, this.x, this.y, 14, 1);
    };

    function spawn(tilemap: Tilemap): Entity[] {
        let entities: Entity[] = [];
        for (let i = tilemap.map_x; i < tilemap.map_x + LEVEL_WIDTH; i++) {
            for (let j = tilemap.map_y; j < tilemap.map_y + LEVEL_HEIGHT; j++) {
                const tile_id = mget(i, j);
                const spawners = tilemap.tileset.spawners[tile_id];
                if (spawners) {
                    const screen_x: number = tilemap.x + (i - tilemap.map_x) * TILE_SIZE;
                    const screen_y: number = tilemap.y + (j - tilemap.map_y) * TILE_SIZE;
                    const spawn: Entity[] = spawners.map((spawner) => spawner(tile_id, screen_x, screen_y));
                    entities = [...entities, ...spawn];
                }
            }
        }
        return entities;
    };

    // Get tile at pixel coordinates
    function get_tile(x: number, y: number): Tile {
        const map_x: number = this.map_x + Math.floor((x - this.x) / TILE_SIZE);
        const map_y: number = this.map_y + Math.floor((y - this.y) / TILE_SIZE);
        const tile_id = mget(map_x, map_y);
        const flags = this.tileset.flags[tile_id];
        return create_tile(tile_id, flags, { x: Math.floor((x - this.map_x) / TILE_SIZE) * TILE_SIZE, y: Math.floor((y - this.map_y) / TILE_SIZE) * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE })
    }

    function get_tiles_in_rect(x: number, y: number, w: number, h: number): Tile[] {
        const tiles: any[] = [];
        const extra_x = w % TILE_SIZE + Math.floor(x) % TILE_SIZE;
        const extra_y = h % TILE_SIZE + Math.floor(y) % TILE_SIZE;
        const tiles_x = Math.floor(w / TILE_SIZE) + (extra_x > 0 ? (extra_x > TILE_SIZE ? 2 : 1) : 0);
        const tiles_y = Math.floor(h / TILE_SIZE) + (extra_y > 0 ? (extra_y > TILE_SIZE ? 2 : 1) : 0);
        for (let i = 0; i < tiles_x; i++) {
            for (let j = 0; j < tiles_y; j++) {
                const tile = this.get_tile(x + i * TILE_SIZE, y + j * TILE_SIZE);
                tiles.push(tile);
            }
        }
        return tiles;
    }

    return {
        ...create_entity(x, y),
        map_x,
        map_y,
        width: LEVEL_WIDTH,
        height: LEVEL_HEIGHT,
        tileset,
        remap,
        spawn,
        get_tile,
        get_tiles_in_rect,
        draw
    }
};