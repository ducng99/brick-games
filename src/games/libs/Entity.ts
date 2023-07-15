import { RendererInstance, rendererHeight, rendererWidth } from '../../stores/RendererStore';

export type Sprite = Array<[number, number]>;

/**
 * A generic entity class that can be used for any game object.
 * Stores position and sprite.
 */
class Entity {
    private _x: number;
    private _y: number;
    private _sprite: Sprite;
    private readonly _boxX?: number;
    private readonly _boxY?: number;
    private readonly _boxWidth?: number;
    private readonly _boxHeight?: number;

    /**
     * @param x X position of the entity.
     * @param y Y position of the entity.
     * @param sprite An array of [x, y] coordinates that represents the sprite.
     * @param collisionBox An array of [x, y, width, height] that represents the collision box. `x` and `y` are relative to the entity position.
     */
    constructor(x: number, y: number, sprite: Sprite, collisionBox?: [number, number, number, number]) {
        this._x = x;
        this._y = y;
        this._sprite = sprite;

        if (collisionBox) {
            this._boxX = collisionBox[0];
            this._boxY = collisionBox[1];
            this._boxWidth = collisionBox[2];
            this._boxHeight = collisionBox[3];
        }

        this.draw();
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    /**
     * Draw entity on the screen.
     */
    draw(): void {
        this._sprite.forEach(([spriteX, spriteY]) => {
            RendererInstance?.setBlock(this.x + spriteX, this.y + spriteY, true);
        });
    }

    /**
     * Clear entity from the screen.
     */
    clear(): void {
        this._sprite.forEach(([spriteX, spriteY]) => {
            RendererInstance?.setBlock(this.x + spriteX, this.y + spriteY, false);
        });
    }

    /**
     * Update current sprite to a new sprite.
     * This function only updates the bricks that are affected old and new by the sprite.
     * @param newSprite The new sprite to update to.
     */
    updateSprite(newSprite: Sprite) {
        const bricksToUpdate: { on: Sprite; off: Sprite } = {
            on: [],
            off: []
        };

        // Get old sprite's bricks positions to disable
        bricksToUpdate.off = this._sprite.map(([spriteX, spriteY]) => [this.x + spriteX, this.y + spriteY]);

        // Get new sprite's bricks positions to enable. Remove from "off" list if exists (remains on).
        newSprite.forEach(([spriteX, spriteY]) => {
            const newSpritePosition: [number, number] = [this.x + spriteX, this.y + spriteY];

            if (newSpritePosition[0] >= 0 && newSpritePosition[0] < rendererWidth && newSpritePosition[1] >= 0 && newSpritePosition[1] < rendererHeight) {
                const offIndex = bricksToUpdate.off.findIndex((brick) => brick[0] === newSpritePosition[0] && brick[1] === newSpritePosition[1]);

                if (offIndex !== -1) {
                    bricksToUpdate.off.splice(offIndex, 1);
                }

                bricksToUpdate.on.push(newSpritePosition);
            }
        });

        bricksToUpdate.off.forEach((brick) => {
            RendererInstance?.setBlock(brick[0], brick[1], false);
        });

        bricksToUpdate.on.forEach((brick) => {
            RendererInstance?.setBlock(brick[0], brick[1], true);
        });

        this._sprite = newSprite;
    }

    /**
     * Update entity position to absolute coordinates.
     * This function only updates the bricks that are affected by the sprite (old and new).
     * @param x
     * @param y
     */
    move(x: number, y: number): void {
        if (x === this.x && y === this.y) return;

        const bricksToUpdate: { on: Sprite; off: Sprite } = {
            on: [],
            off: []
        };

        // Get old sprite's bricks positions to disable
        bricksToUpdate.off = this._sprite.map(([spriteX, spriteY]) => [this.x + spriteX, this.y + spriteY]);

        // Get new sprite's bricks positions to enable. Remove from "off" list if exists (remains on).
        this._sprite.forEach(([spriteX, spriteY]) => {
            const newSpritePosition: [number, number] = [x + spriteX, y + spriteY];

            if (newSpritePosition[0] >= 0 && newSpritePosition[0] < rendererWidth && newSpritePosition[1] >= 0 && newSpritePosition[1] < rendererHeight) {
                const offIndex = bricksToUpdate.off.findIndex((brick) => brick[0] === newSpritePosition[0] && brick[1] === newSpritePosition[1]);

                if (offIndex !== -1) {
                    bricksToUpdate.off.splice(offIndex, 1);
                }

                bricksToUpdate.on.push(newSpritePosition);
            }
        });

        bricksToUpdate.off.forEach((brick) => {
            RendererInstance?.setBlock(brick[0], brick[1], false);
        });

        bricksToUpdate.on.forEach((brick) => {
            RendererInstance?.setBlock(brick[0], brick[1], true);
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
            this.move(this.x + x, this.y + y);
        }
    }

    /**
     * Checks if this entity is colliding with another entity using their sprites
     * @param entity Another entity to check collision with.
     * @param offsetX X offset of current entity to check collision
     * @param offsetY Y offset of current entity to check collision
     * @returns true if colliding, false otherwise.
     */
    isColliding(entity: Entity, offsetX = 0, offsetY = 0): boolean {
        const thisSprite = this._sprite.map(([spriteX, spriteY]) => [this._x + spriteX + offsetX, this._y + spriteY + offsetY]);
        const entitySprite = entity._sprite.map(([spriteX, spriteY]) => [entity._x + spriteX, entity._y + spriteY]);

        return thisSprite.some((thisBrick) => entitySprite.some((entityBrick) => thisBrick[0] === entityBrick[0] && thisBrick[1] === entityBrick[1]));
    }

    /**
     * Checks if this entity is colliding with another entity using their boxes.
     * Both entities must have width and height.
     * @param entity Another entity to check collision with.
     * @param offsetX X offset of current entity to check collision
     * @param offsetY Y offset of current entity to check collision
     * @returns true if colliding, false otherwise. If one of the entities doesn't have width or height, returns false.
     */
    isCollidingBox(entity: Entity, offsetX = 0, offsetY = 0): boolean {
        if (typeof this._boxX !== 'undefined' && typeof this._boxY !== 'undefined' && typeof this._boxWidth !== 'undefined' && typeof this._boxHeight !== 'undefined' &&
            typeof entity._boxX !== 'undefined' && typeof entity._boxY !== 'undefined' && typeof entity._boxWidth !== 'undefined' && typeof entity._boxHeight !== 'undefined'
        ) {
            const thisLeft = this.x + this._boxX + offsetX;
            const thisRight = thisLeft + this._boxWidth;
            const thisTop = this.y + this._boxY + offsetY;
            const thisBottom = thisTop + this._boxHeight;

            const entityLeft = entity.x + entity._boxX;
            const entityRight = entityLeft + entity._boxWidth;
            const entityTop = entity.y + entity._boxY;
            const entityBottom = entityTop + entity._boxHeight;

            return thisLeft < entityRight && thisRight > entityLeft && thisTop < entityBottom && thisBottom > entityTop;
        }

        return false;
    }
}

export default Entity;
