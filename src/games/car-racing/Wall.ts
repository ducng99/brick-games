import Entity from '../libs/Entity';

/**
 * []
 * []
 * []
 */
const wallSprite: Array<[number, number]> = [
    [0, 0],
    [0, 1],
    [0, 2]
];

class Wall extends Entity {
    constructor(x: number, y: number) {
        super(x, y, wallSprite);
    }
}

export default Wall;
