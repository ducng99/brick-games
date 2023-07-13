import { isKeyDown } from '../../libs/KeyboardHandler';
import { pad } from '../../libs/utils';
import { rendererHeight, rendererWidth } from '../../stores/RendererStore';
import Brain from '../libs/Brain';
import Ball from './Ball';
import Paddle from './Paddle';

const paddleWidth = 3;
const paddleMoveDelay = 50;
const ballMoveDelayDefault = 120;

class PongBrain extends Brain {
    private _paddleTop?: Paddle;
    private _paddleBottom?: Paddle;
    private _ball?: Ball;
    private _lastBallMoveFrame: DOMHighResTimeStamp = 0;

    private _playerTopScore = 0;
    private _playerBottomScore = 0;

    private _canBallMove = false;
    private _ballMoveDelay = ballMoveDelayDefault;

    start() {
        // Initialise paddles once on game start
        this.paddleTop.moveRelative(0, 0);
        this.paddleBottom.moveRelative(0, 0);

        // Setup score text
        this.playerBottomScore = 0;
        this.playerTopScore = 0;

        this.restart();
        return super.start();
    }

    update = (timestamp: DOMHighResTimeStamp) => {
        if (this.state === 'started') {
            this.state = 'running';
            this.lastFrame = timestamp;
            this._lastBallMoveFrame = timestamp;
        }

        if (this.state === 'running') {
            let ballCollidedWithPaddle = false;
            const delta = timestamp - this.lastFrame;

            if (delta >= paddleMoveDelay) {
                const steps = Math.floor(delta / paddleMoveDelay);
                const [ballFutureX, ballFutureY] = this.ball.getFuturePosition();

                let paddleBottomMoved = 0;

                if (isKeyDown('ArrowLeft')) {
                    paddleBottomMoved = this.paddleBottom.moveLeft(steps);
                } else if (isKeyDown('ArrowRight')) {
                    paddleBottomMoved = this.paddleBottom.moveRight(steps);
                }

                if (paddleBottomMoved !== 0 && this.ball.isCollidingBox(this.paddleBottom, ballFutureX, ballFutureY)) {
                    this.ball.moveRelative(paddleBottomMoved, 0);

                    if (paddleBottomMoved > 0) {
                        this.ball.direction = 'up-right';
                        ballCollidedWithPaddle = true;
                    } else {
                        this.ball.direction = 'up-left';
                        ballCollidedWithPaddle = true;
                    }
                }

                let paddleTopMoved = 0;

                if (isKeyDown('KeyA')) {
                    paddleTopMoved = this.paddleTop.moveLeft(steps);
                } else if (isKeyDown('KeyD')) {
                    paddleTopMoved = this.paddleTop.moveRight(steps);
                }

                if (paddleTopMoved !== 0 && this.ball.isCollidingBox(this.paddleTop, ballFutureX, ballFutureY)) {
                    this.ball.moveRelative(paddleTopMoved, 0);

                    if (paddleTopMoved > 0) {
                        this.ball.direction = 'down-right';
                        ballCollidedWithPaddle = true;
                    } else {
                        this.ball.direction = 'down-left';
                        ballCollidedWithPaddle = true;
                    }
                }

                this.lastFrame = timestamp;
            }

            // Ball move in different speed compared to paddles
            const ballDelta = timestamp - this._lastBallMoveFrame;

            if (ballDelta >= this._ballMoveDelay) {
                if (!this._canBallMove && isKeyDown('Space')) {
                    this._canBallMove = true;
                }

                if (this._canBallMove) {
                    const steps = Math.floor(ballDelta / this._ballMoveDelay);

                    for (let i = 0; i < steps; i++) {
                        // Checks collision with side-walls
                        if (this.ball.x === 0) {
                            if (this.ball.direction === 'up-left') {
                                this.ball.direction = 'up-right';
                            } else if (this.ball.direction === 'down-left') {
                                this.ball.direction = 'down-right';
                            }
                        } else if (this.ball.x === rendererWidth - 1) {
                            if (this.ball.direction === 'up-right') {
                                this.ball.direction = 'up-left';
                            } else if (this.ball.direction === 'down-right') {
                                this.ball.direction = 'down-left';
                            }
                        }

                        // Checks collision with top and bottom paddles
                        const [ballFutureX, ballFutureY] = this.ball.getFuturePosition();

                        if (this.ball.isCollidingBox(this.paddleBottom, ballFutureX, ballFutureY)) {
                            switch (this.ball.direction) {
                                case 'down-left':
                                    this.ball.direction = 'up-left';
                                    ballCollidedWithPaddle = true;
                                    break;
                                case 'down-right':
                                    this.ball.direction = 'up-right';
                                    ballCollidedWithPaddle = true;
                                    break;
                                case 'down-straight':
                                    this.ball.direction = Math.random() > 0.5 ? 'up-left' : 'up-right';
                                    ballCollidedWithPaddle = true;
                                    break;
                            }
                        } else if (this.ball.isCollidingBox(this.paddleTop, ballFutureX, ballFutureY)) {
                            switch (this.ball.direction) {
                                case 'up-left':
                                    this.ball.direction = 'down-left';
                                    ballCollidedWithPaddle = true;
                                    break;
                                case 'up-right':
                                    this.ball.direction = 'down-right';
                                    ballCollidedWithPaddle = true;
                                    break;
                                case 'up-straight':
                                    this.ball.direction = Math.random() > 0.5 ? 'down-left' : 'down-right';
                                    ballCollidedWithPaddle = true;
                                    break;
                            }
                        }

                        if (ballCollidedWithPaddle) {
                            this.onBallCollideWithPaddle();
                            ballCollidedWithPaddle = false;
                        }

                        this.ball.update();

                        // Checks if ball is out & add score
                        if (this.ball.y < 0) {
                            this.restart();
                            this.playerBottomScore++;
                        } else if (this.ball.y >= rendererHeight) {
                            this.restart();
                            this.playerTopScore++;
                        }
                    }
                }

                this._lastBallMoveFrame = timestamp;
            }
        }
    };

    stop() {
        this._paddleTop = undefined;
        this._paddleBottom = undefined;
        this._ball = undefined;

        return super.stop();
    }

    restart() {
        this._ball = undefined;
        this.ball.moveRelative(0, 0);

        this._canBallMove = false;

        this.state = 'started';
    }

    onBallCollideWithPaddle() {
        // Random chance of ball speed change
        if (this._ballMoveDelay < ballMoveDelayDefault) {
            this._ballMoveDelay = ballMoveDelayDefault;
        } else if (Math.random() <= 0.2) {
            this._ballMoveDelay -= 50;
        }

        // Random chance of ball direction go straight
        if (this.ball.x != 0 && this.ball.x != rendererWidth - 1 && Math.random() <= 0.3) {
            if (this.ball.direction === 'down-left' || this.ball.direction === 'down-right') {
                this.ball.direction = 'down-straight';
            } else if (this.ball.direction === 'up-left' || this.ball.direction === 'up-right') {
                this.ball.direction = 'up-straight';
            }
        }
    }

    get paddleTop(): Paddle {
        if (!this._paddleTop) this._paddleTop = new Paddle(Math.floor((rendererWidth - paddleWidth) * 0.5), 1);

        return this._paddleTop;
    }

    get paddleBottom(): Paddle {
        if (!this._paddleBottom) this._paddleBottom = new Paddle(Math.floor((rendererWidth - paddleWidth) * 0.5), rendererHeight - 2);

        return this._paddleBottom;
    }

    get ball(): Ball {
        if (!this._ball) this._ball = new Ball(Math.floor((rendererWidth - 1) * 0.5), Math.floor(rendererHeight * 0.5));

        return this._ball;
    }

    get playerTopScore() {
        return this._playerTopScore;
    }

    set playerTopScore(score: number) {
        this._playerTopScore = score;

        this.score.set(pad(score, 3, '!') + pad(this._playerBottomScore, 3, '!'));
    }

    get playerBottomScore() {
        return this._playerBottomScore;
    }

    set playerBottomScore(score: number) {
        this._playerBottomScore = score;

        this.score.set(pad(this._playerTopScore, 3, '!') + pad(score, 3, '!'));
    }
}

export default PongBrain;
