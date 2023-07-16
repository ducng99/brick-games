import type { Sprite } from '../../Entity';
import Entity from '../../Entity';

const sprite: Sprite = [
    [1, 0], [2, 0], [3, 0], [6, 0], [1, 1], [3, 1], [5, 1], [6, 1], [1, 2], [3, 2], [6, 2], [1, 3], [3, 3], [6, 3], [1, 4], [2, 4], [3, 4], [5, 4], [6, 4], [7, 4]
];

class Number01 extends Entity {
    constructor(x: number, y: number) {
        super(x, y, sprite);
    }
}

export default Number01;
