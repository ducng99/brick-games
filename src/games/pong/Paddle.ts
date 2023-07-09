import { rendererWidth } from '../../stores/RendererStore';
import Entity, { type Sprite } from '../libs/Entity';

const sprite: Sprite = [
    [0, 0], [1, 0], [2, 0]
];

class Paddle extends Entity {
    constructor(x: number, y: number) {
        super(x, y, sprite, 3, 1);
    }

    moveLeft(steps: number = 1) {
        const x = (this.x - steps) > 0 ? -steps : 0;
        this.moveRelative(x, 0);
    }

    moveRight(steps: number = 1) {
        const x = (this.x + steps < rendererWidth - 3) ? steps : 0;
        this.moveRelative(x, 0);
    }
}

export default Paddle;
