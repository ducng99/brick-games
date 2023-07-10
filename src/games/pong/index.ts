import { isKeyDown } from '../../libs/KeyboardHandler';
import { rendererHeight, rendererWidth } from '../../stores/RendererStore';
import Brain from '../libs/Brain';
import Ball from './Ball';
import Paddle from './Paddle';

const paddleWidth = 3;
const paddleMoveDelay = 50;

class PongBrain extends Brain {
    private _paddleTop?: Paddle;
    private _paddleBottom?: Paddle;
    private _ball?: Ball;

    start() {
        this._paddleTop = new Paddle(Math.floor((rendererWidth - paddleWidth) * 0.5), 1);
        this._paddleBottom = new Paddle(Math.floor((rendererWidth - paddleWidth) * 0.5), rendererHeight - 2);
        this._ball = new Ball(Math.floor((rendererWidth - 1) * 0.5), Math.floor(rendererHeight * 0.5));

        return super.start();
    }

    update = (timestamp: DOMHighResTimeStamp) => {
        if (this.state === 'started') {
            this.state = 'running';
            this.lastFrame = timestamp;
        }

        if (this.state === 'running') {
            const delta = timestamp - this.lastFrame;

            if (delta >= paddleMoveDelay) {
                const steps = Math.floor(delta / paddleMoveDelay);

                if (isKeyDown('ArrowLeft')) {
                    this._paddleTop?.moveLeft(steps);
                } else if (isKeyDown('ArrowRight')) {
                    this._paddleTop?.moveRight(steps);
                }

                if (isKeyDown('KeyA')) {
                    this._paddleBottom?.moveLeft(steps);
                } else if (isKeyDown('KeyD')) {
                    this._paddleBottom?.moveRight(steps);
                }

                this.lastFrame = timestamp;
            }
        }
    };

    stop() {
        this._paddleTop = undefined;
        this._paddleBottom = undefined;
        this._ball = undefined;

        return super.stop();
    }
}

export default PongBrain;
