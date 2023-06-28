import AnimatedFrames from '../AnimatedFrames';
import type { Sprite } from '../Entity';

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
const frames: Sprite[] = Array.from<unknown, Sprite[]>({ length: 4 }, () => [
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

class Explosion extends AnimatedFrames {
    constructor(x: number, y: number) {
        super(x, y, 100, frames, [x, y, 5, 5]);
    }
}

export default Explosion;
