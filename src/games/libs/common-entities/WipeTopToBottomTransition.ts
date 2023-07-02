import { get } from 'svelte/store';
import AnimatedFrames from '../AnimatedFrames';
import { height as screenHeight, width as screenWidth } from '../../../stores/RendererStore';
import type { Sprite } from '../Entity';

const width = get(screenWidth);
const height = get(screenHeight);

const frames: Sprite[] = Array.from({ length: height - 1 }, (_, row) => {
    const ret: Sprite = [];

    for (let i = 0; i <= row; i++) {
        for (let col = 0; col < width; col++) {
            ret.push([col, i]);
        }
    }

    return ret;
}).concat(Array.from({ length: height }, (_, row) => {
    const ret: Sprite = [];

    for (let i = height - row - 1; i >= 0; i--) {
        for (let col = 0; col < width; col++) {
            ret.push([col, i]);
        }
    }

    return ret;
}));

class WipeTopToBottomTransition extends AnimatedFrames {
    constructor() {
        super(0, 0, 10, frames);
    }
}

export default WipeTopToBottomTransition;
