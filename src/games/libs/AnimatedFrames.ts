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
    private readonly _infiniteLoop: boolean;

    /**
     * @param x
     * @param y
     * @param frames An array of frames, each frame is an array of sprites.
     * @param delay Delay between frames in milliseconds.
     * @param clearSquare An array of 4 numbers: [x, y, width, height] to clear the area before playing the animation.
     * @param infiniteLoop If true, the animation will loop forever.
     */
    constructor(x: number, y: number, delay: number, frames: Sprite[], clearSquare?: [number, number, number, number], infiniteLoop: boolean = false) {
        super(x, y, frames.length > 0 ? frames[0] : [], delay);

        this._frames = frames;
        this._clearSquare = clearSquare;
        this._infiniteLoop = infiniteLoop;
    }

    update(timestamp: DOMHighResTimeStamp): void {
        if (this.AnimationState === 'idle') {
            this.AnimationState = 'playing';
            this.lastFrame = timestamp;

            if (this._clearSquare) {
                const [sqX, sqY, sqWidth, sqHeight] = this._clearSquare;

                for (let row = sqY; row < sqY + sqHeight; row++) {
                    for (let col = sqX; col < sqX + sqWidth; col++) {
                        RendererInstance?.setBlock(col, row, false);
                    }
                }

                this.draw();
            }
        }

        if (this.AnimationState === 'playing' && this._frames.length > 0) {
            const delta = timestamp - this.lastFrame;

            if (delta >= this._delay) {
                const steps = Math.floor(delta / this._delay);

                if (this._infiniteLoop) {
                    this._currentFrameIndex = (this._currentFrameIndex + steps) % this._frames.length;
                    this.updateSprite(this._frames[this._currentFrameIndex]);
                } else {
                    this._currentFrameIndex += steps;

                    if (this._currentFrameIndex < this._frames.length) {
                        this.updateSprite(this._frames[this._currentFrameIndex]);
                    } else {
                        this.AnimationState = 'finished';
                    }
                }

                this.lastFrame = timestamp;
            }
        }
    };
}

export default AnimatedFrames;
