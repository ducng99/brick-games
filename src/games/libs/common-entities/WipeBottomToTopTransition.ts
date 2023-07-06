import AnimatedFrames from '../AnimatedFrames';
import { rendererHeight, rendererWidth } from '../../../stores/RendererStore';
import type { Sprite } from '../Entity';

const frames: Sprite[] = Array.from({ length: rendererHeight - 1 }, (_, row) => {
    const ret: Sprite = [];

    for (let i = 0; i <= row; i++) {
        for (let col = 0; col < rendererWidth; col++) {
            ret.push([col, rendererHeight - i - 1]);
        }
    }

    return ret;
}).concat(Array.from({ length: rendererHeight }, (_, row) => {
    const ret: Sprite = [];

    for (let i = rendererHeight - row - 1; i >= 0; i--) {
        for (let col = 0; col < rendererWidth; col++) {
            ret.push([col, rendererHeight - i - 1]);
        }
    }

    return ret;
}));

class WipeBottomToTopTransition extends AnimatedFrames {
    constructor(delay = 10) {
        super(0, 0, delay, frames);
    }
}

export default WipeBottomToTopTransition;
