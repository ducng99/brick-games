import { rendererWidth } from '../../stores/RendererStore';
import Entity, { type Sprite } from '../libs/Entity';

const sprite: Sprite = [
    [0, 0], [1, 0]
];

const paddleWidth = 2;

class Paddle extends Entity {
    constructor(x: number, y: number) {
        super(x, y, sprite, [0, 0, paddleWidth, 1]);
    }

    /**
     * Move the paddle to the left
     * @param steps How many steps to move. Default is 1
     * @returns The number of blocks the paddle actually moved on X-axis
     */
    moveLeft(steps: number = 1) {
        const x = (this.x - steps) > 0 ? -steps : (-this.x + 1);
        this.moveRelative(x, 0);

        return x;
    }

    /**
     * Move the paddle to the right
     * @param steps How many steps to move. Default is 1
     * @returns The number of blocks the paddle actually moved on X-axis
     */
    moveRight(steps: number = 1) {
        const x = (this.x + steps < rendererWidth - paddleWidth) ? steps : (rendererWidth - 1 - paddleWidth - this.x);
        this.moveRelative(x, 0);

        return x;
    }
}

export default Paddle;
