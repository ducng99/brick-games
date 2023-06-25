import { get } from 'svelte/store';
import Entity from './Entity';
import { RendererInstance } from '../../stores/RendererStore';

type AnimatedEntityState = 'idle' | 'playing' | 'finished';

class AnimatedEntity extends Entity {
    private _animationState: AnimatedEntityState = 'idle';
    private readonly _frames: Array<Array<[number, number]>>;
    private readonly _delay: number;
    private _currentFrameIndex: number = 0;
    private _lastFrame: number = performance.now();
    private readonly _clearSquare?: [number, number, number, number];

    get AnimationState(): AnimatedEntityState {
        return this._animationState;
    }

    /**
     *
     * @param x
     * @param y
     * @param frames An array of frames, each frame is an array of sprites.
     * @param delay Delay between frames in milliseconds.
     * @param clearSquare An array of 4 numbers: [x, y, width, height] to clear the area before playing the animation.
     */
    constructor(x: number, y: number, frames: Array<Array<[number, number]>>, delay: number, clearSquare?: [number, number, number, number]) {
        if (frames.length === 0) throw new Error('Frames not provided');
        super(x, y, frames[0]);

        this._frames = frames;
        this._delay = delay;
        this._clearSquare = clearSquare;
    }

    get state(): AnimatedEntityState {
        return this._animationState;
    }

    update = () => {
        if (this.state === 'idle') {
            this._animationState = 'playing';

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

        if (this.state === 'playing') {
            const now = performance.now();
            const delta = now - this._lastFrame;

            if (delta > this._delay) {
                const stepsFloat = delta / this._delay;
                const steps = Math.floor(stepsFloat);
                this._currentFrameIndex += steps;

                if (this._currentFrameIndex < this._frames.length) {
                    this.clear();
                    this._sprite = this._frames[this._currentFrameIndex];
                    this.draw();
                } else {
                    this._animationState = 'finished';
                }

                this._lastFrame = now - (stepsFloat - steps) * this._delay;
            }
        }
    };
}

export default AnimatedEntity;
