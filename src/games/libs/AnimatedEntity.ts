import Entity from './Entity';

type AnimatedEntityState = 'idle' | 'playing' | 'finished';

abstract class AnimatedEntity extends Entity {
    protected _animationState: AnimatedEntityState = 'idle';
    protected readonly _delay: number;
    protected _currentFrameIndex: number = 0;
    protected _lastFrame: number = performance.now();

    /**
     * @param x
     * @param y
     * @param frames An array of frames, each frame is an array of sprites.
     * @param delay Delay between frames in milliseconds.
     * @param clearSquare An array of 4 numbers: [x, y, width, height] to clear the area before playing the animation.
     */
    constructor(x: number, y: number, sprite: Array<[number, number]>, delay: number) {
        super(x, y, sprite);

        this._delay = delay;
    }

    get AnimationState(): AnimatedEntityState {
        return this._animationState;
    }

    abstract update(): void;
}

export default AnimatedEntity;
