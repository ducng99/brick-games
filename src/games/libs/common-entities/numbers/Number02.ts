import type { Sprite } from '../../Entity';
import Entity from '../../Entity';

const sprite: Sprite = [
    [1, 0], [2, 0], [3, 0], [5, 0], [6, 0], [7, 0], [1, 1], [3, 1], [7, 1], [1, 2], [3, 2], [5, 2], [6, 2], [7, 2], [1, 3], [3, 3], [5, 3], [1, 4], [2, 4], [3, 4], [5, 4], [6, 4], [7, 4]
];

class Number02 extends Entity {
    constructor(x: number, y: number) {
        super(x, y, sprite);
    }
}

export default Number02;
