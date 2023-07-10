import { RendererInstance, rendererHeight, rendererWidth } from '../../../stores/RendererStore';
import AnimatedEntity from '../AnimatedEntity';

/**
 * This is a special animation that toggle the blocks in a swirl/tornado pattern. From bottom left to middle.
 */
class SwirlEffect extends AnimatedEntity {
    private _currentLayer: number = 0;
    private _currentX = 0;
    private _currentY = rendererHeight - 1;

    constructor() {
        super(0, 0, [], 13.8);
    }

    update(timestamp: DOMHighResTimeStamp): void {
        if (this.AnimationState === 'idle') {
            this.AnimationState = 'playing';
            this.lastFrame = timestamp;
        }

        if (this.AnimationState === 'playing') {
            const delta = timestamp - this.lastFrame;
            if (delta >= this._delay) {
                const steps = Math.floor(delta / this._delay);

                for (let i = 0; i < steps; i++) {
                    RendererInstance?.setBlock(this._currentX, this._currentY);

                    if (this._currentLayer == Math.floor(Math.min(rendererWidth / 2, rendererHeight / 2))) {
                        this.AnimationState = 'finished';
                    }

                    if (this._currentX < rendererWidth - 1 - this._currentLayer && this._currentY == rendererHeight - 1 - this._currentLayer) {
                        this._currentX += 1;
                    } else if (this._currentX == rendererWidth - 1 - this._currentLayer && this._currentY > this._currentLayer) {
                        this._currentY -= 1;
                    } else if (this._currentX > this._currentLayer && this._currentY == this._currentLayer) {
                        this._currentX -= 1;
                    } else if (this._currentX == this._currentLayer && this._currentY < rendererHeight - 1 - this._currentLayer) {
                        this._currentY += 1;
                    }

                    if (this._currentX == this._currentLayer && this._currentY == rendererHeight - 2 - this._currentLayer) {
                        this._currentLayer++;
                    }
                }

                this.lastFrame = timestamp;
            }
        }
    }
}

export default SwirlEffect;
