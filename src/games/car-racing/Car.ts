import Entity from '../libs/Entity';

/**
 *   []
 * [][][]
 *   []
 * []  []
 */
const carSprite: Array<[number, number]> = [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
    [0, 3],
    [2, 3]
];

class Car extends Entity {
    constructor(x: number, y: number) {
        super(x, y, carSprite, 3, 4);
    }
}

export default Car;
