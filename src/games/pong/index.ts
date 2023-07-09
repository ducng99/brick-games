import { isKeyDown } from '../../libs/KeyboardHandler';
import { rendererHeight, rendererWidth } from '../../stores/RendererStore';
import Brain from '../libs/Brain';
import Ball from './Ball';
import Paddle from './Paddle';

const paddleWidth = 3;
const paddleMoveDelay = 50;

class PongBrain extends Brain {
    private _paddle1?: Paddle;
    private _paddle2?: Paddle;
    private _ball?: Ball;

    start() {
        this._paddle1 = new Paddle(Math.floor((rendererWidth - paddleWidth) * 0.5), 1);
        this._paddle2 = new Paddle(Math.floor((rendererWidth - paddleWidth) * 0.5), rendererHeight - 2);
        this._ball = new Ball(Math.floor((rendererWidth - 1) * 0.5), Math.floor(rendererHeight * 0.5));

        return super.start();
    }

    update = () => {
        if (this.state === 'started') {
            this.state = 'running';
            this.lastFrame = performance.now();
        }

        if (this.state === 'running') {
            const delta = performance.now() - this.lastFrame;

            if (delta >= paddleMoveDelay) {
                const steps = Math.floor(delta / paddleMoveDelay);

                if (isKeyDown('ArrowLeft')) {
                    this._paddle1?.moveLeft(steps);
                } else if (isKeyDown('ArrowRight')) {
                    this._paddle1?.moveRight(steps);
                }

                if (isKeyDown('KeyA')) {
                    this._paddle2?.moveLeft(steps);
                } else if (isKeyDown('KeyD')) {
                    this._paddle2?.moveRight(steps);
                }

                this.lastFrame = performance.now();
            }
        }
    };

    stop() {
        this._paddle1 = undefined;
        this._paddle2 = undefined;
        this._ball = undefined;

        return super.stop();
    }
}

export default PongBrain;
