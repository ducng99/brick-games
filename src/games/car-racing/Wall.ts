import Entity, { type Sprite } from '../libs/Entity';

/**
 * []
 * []
 * []
 */
const wallSprite: Sprite = [
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
