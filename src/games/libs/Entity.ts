import { get } from 'svelte/store';
import { bricks } from '../../stores/RendererStore';

/**
 * A generic entity class that can be used for any game object.
 * Stores X-Y position and width-height size.
 */
class Entity {
    x: number;
    y: number;

    private readonly _sprite: Array<[number, number]>;

    constructor(x: number, y: number, sprite: Array<[number, number]>) {
        this.x = x;
        this.y = y;
        this._sprite = sprite;

        const _bricks = get(bricks);

        sprite.forEach(([spriteX, spriteY]) => {
            _bricks[y + spriteY][x + spriteX].toggle(true);
        });
    }

    /**
     * Update entity position to absolute coordinates.
     * This function only updates the bricks that are affected by the sprite (old and new).
     * @param x
     * @param y
     */
    move(x: number, y: number): void {
        if (x === this.x && y === this.y) return;

        const _bricks = get(bricks);

        const bricksToUpdate: { on: string[]; off: string[] } = {
            on: [],
            off: []
        };

        // Get old sprite's bricks positions to disable
        bricksToUpdate.off = this._sprite.map(([spriteX, spriteY]) => JSON.stringify([this.x + spriteX, this.y + spriteY]));

        // Get new sprite's bricks positions to enable. Remove from "off" list if exists (remains on).
        this._sprite.forEach(([spriteX, spriteY]) => {
            const newSpritePosition = JSON.stringify([x + spriteX, y + spriteY]);
            const offIndex = bricksToUpdate.off.findIndex((brick) => brick === newSpritePosition);

            if (offIndex !== -1) {
                bricksToUpdate.off.splice(offIndex, 1);
            } else {
                bricksToUpdate.on.push(newSpritePosition);
            }
        });

        bricksToUpdate.off.forEach((brick) => {
            const [x, y] = JSON.parse(brick) as [number, number];

            if (x >= 0 && x < _bricks[0].length && y >= 0 && y < _bricks.length) {
                _bricks[y][x].toggle(false);
            }
        });

        bricksToUpdate.on.forEach((brick) => {
            const [x, y] = JSON.parse(brick) as [number, number];

            if (x >= 0 && x < _bricks[0].length && y >= 0 && y < _bricks.length) {
                _bricks[y][x].toggle(true);
            }
        });

        this.x = x;
        this.y = y;
    }

    /**
     * Move entity position to relative coordinates.
     * @param x
     * @param y
     * @uses {@link move}
     */
    moveRelative(x: number, y: number): void {
        this.move(this.x + x, this.y + y);
    }
}

export default Entity;
