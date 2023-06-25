import { get } from 'svelte/store';
import { RendererInstance } from '../../stores/RendererStore';

/**
 * A generic entity class that can be used for any game object.
 * Stores position and sprite.
 */
class Entity {
    protected _x: number;
    protected _y: number;
    protected _width?: number;
    protected _height?: number;

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    protected _sprite: Array<[number, number]>;

    /**
     *
     * @param x
     * @param y
     * @param sprite An array of [x, y] coordinates that represents the sprite.
     * @param width The width of entity. Used for box collision detection.
     * @param height The height of entity. Used for box collision detection.
     */
    constructor(x: number, y: number, sprite: Array<[number, number]>, width?: number, height?: number) {
        this._x = x;
        this._y = y;
        this._sprite = sprite;
        this._width = width;
        this._height = height;

        this.draw();
    }

    /**
     * Draw entity on the screen.
     */
    draw(): void {
        const renderer = get(RendererInstance);

        this._sprite.forEach(([spriteX, spriteY]) => {
            renderer?.setBlock(this.x + spriteX, this.y + spriteY, true);
        });
    }

    /**
     * Clear entity from the screen.
     */
    clear(): void {
        const renderer = get(RendererInstance);

        this._sprite.forEach(([spriteX, spriteY]) => {
            renderer?.setBlock(this.x + spriteX, this.y + spriteY, false);
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

        this._x = x;
        this._y = y;
    }

    /**
     * Move entity position to relative coordinates.
     * @param x
     * @param y
     * @uses {@link move}
     */
    moveRelative(x: number, y: number): void {
        if (x != 0 || y != 0) {
            this.move(this._x + x, this._y + y);
        }
    }

    /**
     * Checks if this entity is colliding with another entity using their sprites
     * @param entity Another entity to check collision with.
     */
    isColliding(entity: Entity): boolean {
        const thisSprite = this._sprite.map(([spriteX, spriteY]) => [this._x + spriteX, this._y + spriteY]);
        const entitySprite = entity._sprite.map(([spriteX, spriteY]) => [entity._x + spriteX, entity._y + spriteY]);

        return thisSprite.some((thisBrick) => entitySprite.some((entityBrick) => thisBrick[0] === entityBrick[0] && thisBrick[1] === entityBrick[1]));
    }

    /**
     * Checks if this entity is colliding with another entity using their boxes.
     * Both entities must have width and height.
     * @param entity Another entity to check collision with.
     * @returns true if colliding, false otherwise. If one of the entities doesn't have width or height, returns false.
     */
    isCollidingBox(entity: Entity): boolean {
        if (!this._width || !this._height || !entity._width || !entity._height) return false;

        const thisLeft = this.x;
        const thisRight = this.x + this._width;
        const thisTop = this.y;
        const thisBottom = this.y + this._height;

        const entityLeft = entity.x;
        const entityRight = entity.x + entity._width;
        const entityTop = entity.y;
        const entityBottom = entity.y + entity._height;

        return thisLeft < entityRight && thisRight > entityLeft && thisTop < entityBottom && thisBottom > entityTop;
    }
}

export default Entity;
