import { get } from 'svelte/store';
import { RendererInstance } from '../../stores/RendererStore';
import AnimatedEntity from './AnimatedEntity';
import type { Sprite } from './Entity';

/**
 * Helper base class for simple pre-defined frames animations.
 */
class AnimatedFrames extends AnimatedEntity {
    private readonly _frames: Sprite[];
    private _currentFrameIndex: number = 0;
    private readonly _clearSquare?: [number, number, number, number];

    /**
     * @param x
     * @param y
     * @param frames An array of frames, each frame is an array of sprites.
     * @param delay Delay between frames in milliseconds.
     * @param clearSquare An array of 4 numbers: [x, y, width, height] to clear the area before playing the animation.
     */
    constructor(x: number, y: number, delay: number, frames: Sprite[], clearSquare?: [number, number, number, number]) {
        if (frames.length === 0) throw new Error('Frames not provided');
        super(x, y, frames[0], delay);

        this._frames = frames;
        this._clearSquare = clearSquare;
    }

    update = () => {
        if (this.AnimationState === 'idle') {
            this.AnimationState = 'playing';
            this.lastFrame = performance.now();

            if (this._clearSquare) {
                const renderer = get(RendererInstance);
                const [sqX, sqY, sqWidth, sqHeight] = this._clearSquare;

                for (let row = sqY; row < sqY + sqHeight; row++) {
                    for (let col = sqX; col < sqX + sqWidth; col++) {
                        renderer?.setBlock(col, row, false);
                    }
                }
            }
        }

        if (this.AnimationState === 'playing') {
            const now = performance.now();
            const delta = now - this.lastFrame;

            if (delta > this._delay) {
                const stepsFloat = delta / this._delay;
                const steps = Math.floor(stepsFloat);
                this._currentFrameIndex += steps;

                if (this._currentFrameIndex < this._frames.length) {
                    this.updateSprite(this._frames[this._currentFrameIndex]);
                } else {
                    this.AnimationState = 'finished';
                }

                this.lastFrame = now;
            }
        }
    };
}

export default AnimatedFrames;
