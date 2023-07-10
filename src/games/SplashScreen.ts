import { isKeyDown } from '../libs/KeyboardHandler';
import { RendererInstance } from '../stores/RendererStore';
import Brain from './libs/Brain';
import type { Sprite } from './libs/Entity';
import FlashEffect from './libs/special-animations/FlashEffect';
import SwirlEffect from './libs/special-animations/SwirlEffect';

const textSprite: Sprite = [
    [1, 1], [2, 1], [5, 1], [6, 1], [1, 2], [3, 2], [5, 2], [7, 2], [1, 3], [2, 3], [5, 3], [6, 3], [1, 4], [3, 4], [5, 4], [7, 4], [1, 5], [2, 5], [5, 5], [7, 5], [1, 7], [2, 7], [3, 7], [6, 7], [7, 7], [2, 8], [5, 8], [2, 9], [5, 9], [2, 10], [5, 10], [1, 11], [2, 11], [3, 11], [6, 11], [7, 11], [1, 13], [3, 13], [6, 13], [7, 13], [1, 14], [3, 14], [5, 14], [1, 15], [2, 15], [6, 15], [1, 16], [3, 16], [7, 16], [1, 17], [3, 17], [5, 17], [6, 17]
];

class SplashScreen extends Brain {
    private _swirlAnimation?: SwirlEffect;
    private _flashAnimation?: FlashEffect;
    private _effectState: 'swirl1' | 'flash1' | 'swirl2' | 'flash2' = 'swirl1';

    start() {
        textSprite.forEach(([x, y]) => {
            RendererInstance?.setBlock(x, y, true);
        });

        return super.start();
    }

    update = (timestamp: DOMHighResTimeStamp) => {
        if (this.state === 'started') {
            this.state = 'running';
        }

        if (this.state === 'running') {
            if (isKeyDown()) {
                this.stop();
            }

            switch (this._effectState) {
                case 'swirl1':
                    if (!this._swirlAnimation) {
                        this._swirlAnimation = new SwirlEffect();
                    }

                    this._swirlAnimation.update(timestamp);

                    if (this._swirlAnimation.AnimationState === 'finished') {
                        this._swirlAnimation = undefined;
                        this._effectState = 'flash1';
                    }
                    break;
                case 'flash1':
                    if (!this._flashAnimation) {
                        this._flashAnimation = new FlashEffect(textSprite, 439, 9, true);
                    }

                    this._flashAnimation.update(timestamp);

                    if (this._flashAnimation.AnimationState === 'finished') {
                        this._flashAnimation = undefined;
                        this._effectState = 'swirl2';
                    }
                    break;
                case 'swirl2':
                    if (!this._swirlAnimation) {
                        this._swirlAnimation = new SwirlEffect();
                    }

                    this._swirlAnimation.update(timestamp);

                    if (this._swirlAnimation.AnimationState === 'finished') {
                        this._swirlAnimation = undefined;
                        this._effectState = 'flash2';
                    }
                    break;
                case 'flash2':
                    if (!this._flashAnimation) {
                        this._flashAnimation = new FlashEffect(textSprite, 439, 9, false);

                        textSprite.forEach(([x, y]) => {
                            RendererInstance?.setBlock(x, y, false);
                        });
                    }

                    this._flashAnimation.update(timestamp);

                    if (this._flashAnimation.AnimationState === 'finished') {
                        this._flashAnimation = undefined;
                        this._effectState = 'swirl1';
                    }
                    break;
                default:
                    this.stop();
                    break;
            }
        }
    };

    stop() {
        this._swirlAnimation = undefined;
        this._flashAnimation = undefined;

        return super.stop();
    }
}

export default SplashScreen;
