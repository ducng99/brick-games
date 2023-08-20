import { rendererWidth } from '../../stores/RendererStore';
import AnimatedFrames from '../libs/AnimatedFrames';
import type { Sprite } from '../libs/Entity';

const frames: Sprite[] = [
    [[2, 0], [5, 0], [8, 0], [3, 1], [4, 1], [6, 1], [7, 1], [4, 4], [4, 6], [3, 7], [4, 7], [5, 7]],
    [[2, 0], [5, 0], [8, 0], [3, 1], [4, 1], [6, 1], [7, 1], [4, 2], [4, 6], [3, 7], [4, 7], [5, 7]],
    [[2, 0], [5, 0], [8, 0], [3, 1], [6, 1], [7, 1], [5, 6], [4, 7], [5, 7], [6, 7]],
    [[1, 1], [4, 1], [7, 1], [2, 2], [5, 2], [6, 2], [6, 6], [5, 7], [6, 7], [7, 7]]
];

class MenuAnimation extends AnimatedFrames {
    constructor(x: number, y: number) {
        super(x, y, 720, frames, [x, y, rendererWidth, 8], true);
    }
}

export default MenuAnimation;
