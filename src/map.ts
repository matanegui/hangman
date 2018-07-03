const TILE_SIZE: number = 8;

/* TILE */
interface Tile {
    id: number;
    flags: { [id: string]: boolean };
    box: { x, y, w, h }
}

const create_tile: (id: number, flags?: string[], box?: { x: number, y: number, w: number, h: number }) => Tile = (id, flags = [], box = { x: 0, y: 0, w: 0, h: 0 }) => ({
    id,
    box,
    flags: flags.reduce((accumulator: { [id: string]: boolean }, flag: string) => {
        accumulator[flag] = true;
        return accumulator;
    }, {})
});

/* TILEMAP */
const create_tilemap: (x: number, y: number, width: number, height: number) => any = (x, y, width, height) => ({
    x,
    y,
    width,
    height,
    data: []
});

const add_tile_data: (tilemap: any, id: number, flags: string[]) => void = (tilemap, id, flags) => {
    tilemap.data[id] = flags;
}

// Get tile at pixel coordinates
const get_tile: (tilemap: any, x: number, y: number) => any = (tilemap, x, y) => {
    const map_x: number = Math.floor((x - tilemap.x) / TILE_SIZE);
    const map_y: number = Math.floor((y - tilemap.y) / TILE_SIZE);
    const tile_id = mget(map_x, map_y);
    const flags = tilemap.data[tile_id];
    return create_tile(tile_id, flags, { x: Math.floor((x - tilemap.x) / TILE_SIZE) * TILE_SIZE, y: Math.floor((y - tilemap.y) / TILE_SIZE) * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE })
}

const get_tiles_in_rect: (tilemap: any, x: number, y: number, w: number, h: number) => any[] = (tilemap, x, y, w, h) => {
    const tiles: any[] = [];
    const extra_x = w % TILE_SIZE + Math.floor(x) % TILE_SIZE;
    const extra_y = h % TILE_SIZE + Math.floor(y) % TILE_SIZE;
    const tiles_x = Math.floor(w / TILE_SIZE) + (extra_x > 0 ? (extra_x > TILE_SIZE ? 2 : 1) : 0);
    const tiles_y = Math.floor(h / TILE_SIZE) + (extra_y > 0 ? (extra_y > TILE_SIZE ? 2 : 1) : 0);
    for (let i = 0; i < tiles_x; i++) {
        for (let j = 0; j < tiles_y; j++) {
            const tile = get_tile(tilemap, x + i * TILE_SIZE, y + j * TILE_SIZE);
            tiles.push(tile);
        }
    }
    return tiles;
}

const draw_map: (tilemap: any, remap: any) => void = (tilemap, remap) => {
    map(tilemap.x, tilemap.y, tilemap.width, tilemap.height, 0, 0, 0, 1, remap);
};