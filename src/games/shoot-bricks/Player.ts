import { rendererWidth } from '../../stores/RendererStore';
import Entity, { type Sprite } from '../libs/Entity';

/**
 *   []
 * [][][]
 */
const sprite: Sprite = [
    [1, 0],
    [0, 1], [1, 1], [2, 1]
];

class Player extends Entity {
    isShooting = false;

    constructor(x: number, y: number) {
        super(x, y, sprite, [0, 0, 3, 2]);
    }

    /**
     * Move player to the left
     * @param steps How many steps to move. Default is 1
     * @returns The number of blocks the player actually moved on X-axis
     */
    moveLeft(steps: number = 1) {
        const x = (this.x - steps) >= -1 ? -steps : (-this.x - 1);
        this.moveRelative(x, 0);
    }

    /**
     * Move player to the right
     * @param steps How many steps to move. Default is 1
     * @returns The number of blocks the player actually moved on X-axis
     */
    moveRight(steps: number = 1) {
        const x = (this.x + steps < rendererWidth - 2) ? steps : (rendererWidth - 2 - this.x);
        this.moveRelative(x, 0);
    }
}

export default Player;
