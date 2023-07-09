import Entity from '../libs/Entity';

class Ball extends Entity {
    constructor(x: number, y: number) {
        super(x, y, [[0, 0]], 1, 1);
    }
}

export default Ball;
