import { rendererHeight } from '../../../stores/RendererStore';
import Entity, { type Sprite } from '../../libs/Entity';

const sprite: Sprite = [
    [0, 0], [0, 1], [0, 2]
];

export const paddleHeight = 3;

class Paddle extends Entity {
    constructor(x: number, y: number) {
        super(x, y, sprite, [0, 0, 1, paddleHeight]);
    }

    /**
     * Move the paddle up
     * @param steps How many steps to move. Default is 1
     * @returns The number of blocks the paddle actually moved on Y-axis
     */
    moveUp(steps: number = 1) {
        const y = (this.y - steps) > 0 ? -steps : (-this.y + 1);
        this.moveRelative(0, y);

        return y;
    }

    /**
     * Move the paddle down
     * @param steps How many steps to move. Default is 1
     * @returns The number of blocks the paddle actually moved on Y-axis
     */
    moveDown(steps: number = 1) {
        const y = (this.y + steps < rendererHeight - paddleHeight) ? steps : (rendererHeight - 1 - paddleHeight - this.y);
        this.moveRelative(0, y);

        return y;
    }
}

export default Paddle;
