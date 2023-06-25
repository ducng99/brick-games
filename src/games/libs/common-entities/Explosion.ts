import AnimatedEntity from '../AnimatedEntity';

/**
 *
 *
 *     []
 *
 *
 *
 * ----------
 *
 *   [][][]
 *   []  []
 *   [][][]
 *
 * ----------
 * []  []  []
 *
 * []      []
 *
 * []  []  []
 * ----------
 *   []  []
 * []      []
 *
 * []      []
 *   []  []
 * ----------
 * []  []  []
 *
 * []      []
 *
 * []  []  []
 * ----------
 *
 *   [][][]
 *   []  []
 *   [][][]
 *
 * ----------
 * 4 times the above
 */
const frames: Array<Array<[number, number]>> = Array.from<unknown, Array<Array<[number, number]>>>({ length: 4 }, () => [
    [
        [2, 2]
    ],
    [
        [1, 1], [2, 1], [3, 1],
        [1, 2], [3, 2],
        [1, 3], [2, 3], [3, 3]
    ],
    [
        [0, 0], [2, 0], [4, 0],
        [0, 2], [4, 2],
        [0, 4], [2, 4], [4, 4]
    ],
    [
        [1, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 3], [4, 3],
        [1, 4], [3, 4]
    ],
    [
        [0, 0], [2, 0], [4, 0],
        [0, 2], [4, 2],
        [0, 4], [2, 4], [4, 4]
    ],
    [
        [1, 1], [2, 1], [3, 1],
        [1, 2], [3, 2],
        [1, 3], [2, 3], [3, 3]
    ]
]).flat();

class Explosion extends AnimatedEntity {
    constructor(x: number, y: number) {
        super(x, y, frames, 100, [x, y, 5, 5]);
    }
}

export default Explosion;
