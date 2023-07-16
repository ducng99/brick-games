import { rendererWidth } from '../../stores/RendererStore';
import AnimatedFrames from '../libs/AnimatedFrames';
import type { Sprite } from '../libs/Entity';

const frames: Sprite[] = [
    [[1, 0], [2, 0], [3, 0], [4, 3], [6, 7], [7, 7], [8, 7]],
    [[2, 0], [3, 0], [4, 0], [2, 1], [4, 7], [5, 7], [6, 7]],
    [[2, 0], [3, 0], [4, 0], [0, 3], [2, 7], [3, 7], [4, 7]],
    [[4, 0], [5, 0], [6, 0], [2, 5], [2, 7], [3, 7], [4, 7]]
];

class MenuAnimation extends AnimatedFrames {
    constructor(x: number, y: number) {
        super(x, y, 720, frames, [x, y, rendererWidth, 8], true);
    }
}

export default MenuAnimation;
