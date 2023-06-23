import { get } from 'svelte/store';
import { RendererInstance } from '../../stores/RendererStore';

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

        const renderer = get(RendererInstance);

        sprite.forEach(([spriteX, spriteY]) => {
            renderer?.setBlock(x + spriteX, y + spriteY, true);
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

        const bricksToUpdate: { on: Array<[number, number]>; off: Array<[number, number]> } = {
            on: [],
            off: []
        };

        // Get old sprite's bricks positions to disable
        bricksToUpdate.off = this._sprite.map(([spriteX, spriteY]) => [this.x + spriteX, this.y + spriteY]);

        // Get new sprite's bricks positions to enable. Remove from "off" list if exists (remains on).
        this._sprite.forEach(([spriteX, spriteY]) => {
            const newSpritePosition: [number, number] = [x + spriteX, y + spriteY];
            const offIndex = bricksToUpdate.off.findIndex((brick) => brick[0] === newSpritePosition[0] && brick[1] === newSpritePosition[1]);

            if (offIndex !== -1) {
                bricksToUpdate.off.splice(offIndex, 1);
            } else {
                bricksToUpdate.on.push(newSpritePosition);
            }
        });

        const renderer = get(RendererInstance);

        bricksToUpdate.off.forEach((brick) => {
            renderer?.setBlock(brick[0], brick[1], false);
        });

        bricksToUpdate.on.forEach((brick) => {
            renderer?.setBlock(brick[0], brick[1], true);
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
        if (x != 0 || y != 0) {
            this.move(this.x + x, this.y + y);
        }
    }
}

export default Entity;
