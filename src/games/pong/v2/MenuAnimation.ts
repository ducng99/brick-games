import { rendererWidth } from '../../../stores/RendererStore';
import AnimatedFrames from '../../libs/AnimatedFrames';
import type { Sprite } from '../../libs/Entity';

const frames: Sprite[] = [
    [[0, 1], [0, 2], [6, 2], [0, 3], [9, 4], [9, 5], [9, 6]],
    [[0, 2], [0, 3], [0, 4], [8, 4], [9, 4], [9, 5], [9, 6]],
    [[9, 3], [0, 4], [9, 4], [0, 5], [9, 5], [0, 6], [6, 6]],
    [[0, 1], [0, 2], [9, 2], [0, 3], [3, 3], [9, 3], [9, 4]]
];

class MenuAnimation extends AnimatedFrames {
    constructor(x: number, y: number) {
        super(x, y, 720, frames, [x, y, rendererWidth, 8], true);
    }
}

export default MenuAnimation;
