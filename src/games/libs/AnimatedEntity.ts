import Entity, { type Sprite } from './Entity';

type AnimatedEntityState = 'idle' | 'playing' | 'finished';

abstract class AnimatedEntity extends Entity {
    private _animationState: AnimatedEntityState = 'idle';
    protected readonly _delay: number;
    protected lastFrame: number = 0;

    /**
     * @param x
     * @param y
     * @param sprite Initial sprite.
     * @param delay Delay between frames in milliseconds.
     */
    constructor(x: number, y: number, sprite: Sprite, delay: number) {
        super(x, y, sprite);

        this._delay = delay;
    }

    get AnimationState(): AnimatedEntityState {
        return this._animationState;
    }

    protected set AnimationState(state: AnimatedEntityState) {
        this._animationState = state;
    }

    abstract update(): void;
}

export default AnimatedEntity;
