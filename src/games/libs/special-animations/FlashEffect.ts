import AnimatedEntity from '../AnimatedEntity';
import type { Sprite } from '../Entity';

/**
 * Turn a given set of blocks (sprite) on and off in a given number of times.
 */
class FlashEffect extends AnimatedEntity {
    private _times: number = 0;
    private readonly _initialSprite: Sprite;
    private _currentState: boolean;

    constructor(sprite: Sprite, delay: number, times: number, initialState = true) {
        super(0, 0, initialState ? sprite : [], delay);

        this._initialSprite = sprite;
        this._times = times;
        this._currentState = initialState;
    }

    update(): void {
        if (this.AnimationState === 'idle') {
            this.AnimationState = 'playing';
            this.lastFrame = performance.now();
        }

        if (this.AnimationState === 'playing') {
            const delay = performance.now() - this.lastFrame;
            if (delay >= this._delay) {
                if (this._currentState) {
                    this.updateSprite([]);
                    this._currentState = false;
                } else {
                    this.updateSprite(this._initialSprite);
                    this._currentState = true;
                }

                this._times--;

                if (this._times == 0) {
                    this.AnimationState = 'finished';
                }

                this.lastFrame = performance.now();
            }
        }
    }
}

export default FlashEffect;
