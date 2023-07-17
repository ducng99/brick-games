import { isKeyDown } from '../../../libs/KeyboardHandler';
import { pad } from '../../../libs/utils';
import { rendererHeight, rendererWidth } from '../../../stores/RendererStore';
import Brain from '../../libs/Brain';
import Ball from './Ball';
import Paddle, { paddleHeight } from './Paddle';

const paddleMoveDelay = 30;
const ballMoveDelayDefault = 80;

class PongBrain extends Brain {
    private _paddleLeft?: Paddle;
    private _paddleRight?: Paddle;
    private _ball?: Ball;
    private _lastBallMoveFrame: DOMHighResTimeStamp = 0;

    private _playerLeftScore = 0;
    private _playerRightScore = 0;

    private _canBallMove = false;
    // Initial speed is slower as it starts from middle screen
    private _ballMoveDelay = ballMoveDelayDefault + 50;

    setRendererWidthHeight(): [width: number, height: number] {
        return [29, 29];
    }

    start() {
        // Initialise paddles once on game start
        this.paddleLeft.moveRelative(0, 0);
        this.paddleRight.moveRelative(0, 0);

        // Setup score text
        this.playerRightScore = 0;
        this.playerLeftScore = 0;

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

                let paddleRightMoved = 0;

                if (isKeyDown('ArrowUp')) {
                    paddleRightMoved = this.paddleRight.moveUp(steps);
                } else if (isKeyDown('ArrowDown')) {
                    paddleRightMoved = this.paddleRight.moveDown(steps);
                }

                if (paddleRightMoved !== 0 && this.ball.isCollidingBox(this.paddleRight, ballFutureX, ballFutureY)) {
                    this.ball.moveRelative(paddleRightMoved, 0);

                    if (paddleRightMoved > 0) {
                        this.ball.direction = 'down-left';
                        ballCollidedWithPaddle = true;
                    } else {
                        this.ball.direction = 'up-left';
                        ballCollidedWithPaddle = true;
                    }
                }

                let paddleLeftMoved = 0;

                if (isKeyDown('KeyW')) {
                    paddleLeftMoved = this.paddleLeft.moveUp(steps);
                } else if (isKeyDown('KeyS')) {
                    paddleLeftMoved = this.paddleLeft.moveDown(steps);
                }

                if (paddleLeftMoved !== 0 && this.ball.isCollidingBox(this.paddleLeft, ballFutureX, ballFutureY)) {
                    this.ball.moveRelative(paddleLeftMoved, 0);

                    if (paddleLeftMoved > 0) {
                        this.ball.direction = 'down-right';
                        ballCollidedWithPaddle = true;
                    } else {
                        this.ball.direction = 'up-right';
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
                        if (this.ball.y === 0) {
                            switch (this.ball.direction) {
                                case 'up-left':
                                    this.ball.direction = 'down-left';
                                    break;
                                case 'up-right':
                                    this.ball.direction = 'down-right';
                                    break;
                            }
                        } else if (this.ball.y === rendererHeight - 1) {
                            switch (this.ball.direction) {
                                case 'down-left':
                                    this.ball.direction = 'up-left';
                                    break;
                                case 'down-right':
                                    this.ball.direction = 'up-right';
                                    break;
                            }
                        }

                        // Checks collision with left and right paddles
                        const [ballFutureX, ballFutureY] = this.ball.getFuturePosition();

                        if (this.ball.isCollidingBox(this.paddleRight, ballFutureX, ballFutureY)) {
                            switch (this.ball.direction) {
                                case 'up-right':
                                    this.ball.direction = 'up-left';
                                    ballCollidedWithPaddle = true;
                                    break;
                                case 'down-right':
                                    this.ball.direction = 'down-left';
                                    ballCollidedWithPaddle = true;
                                    break;
                                default:
                                    this.ball.direction = Math.random() > 0.5 ? 'up-left' : 'down-left';
                                    ballCollidedWithPaddle = true;
                                    break;
                            }
                        } else if (this.ball.isCollidingBox(this.paddleLeft, ballFutureX, ballFutureY)) {
                            switch (this.ball.direction) {
                                case 'up-left':
                                    this.ball.direction = 'up-right';
                                    ballCollidedWithPaddle = true;
                                    break;
                                case 'down-left':
                                    this.ball.direction = 'down-right';
                                    ballCollidedWithPaddle = true;
                                    break;
                                default:
                                    this.ball.direction = Math.random() > 0.5 ? 'up-right' : 'down-right';
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
                        if (this.ball.x < 0) {
                            this.restart();
                            this.playerRightScore++;
                        } else if (this.ball.x >= rendererWidth) {
                            this.restart();
                            this.playerLeftScore++;
                        }
                    }
                }

                this._lastBallMoveFrame = timestamp;
            }
        }
    };

    stop() {
        this._paddleLeft = undefined;
        this._paddleRight = undefined;
        this._ball = undefined;

        return super.stop();
    }

    restart() {
        this._ball = undefined;
        this.ball.moveRelative(0, 0);

        this._canBallMove = false;
        this._ballMoveDelay = ballMoveDelayDefault + 50;

        this.state = 'started';
    }

    onBallCollideWithPaddle() {
        // Random chance of ball speed change
        if (this._ballMoveDelay != ballMoveDelayDefault) {
            this._ballMoveDelay = ballMoveDelayDefault;
        } else if (Math.random() <= 0.2) {
            this._ballMoveDelay *= 0.5;
        }

        // Random chance of ball direction go straight
        if (this.ball.y != 0 && this.ball.y != rendererHeight - 1 && Math.random() <= 0.3) {
            switch (this.ball.direction) {
                case 'down-left':
                case 'up-left':
                    this.ball.direction = 'left-straight';
                    break;
                case 'down-right':
                case 'up-right':
                    this.ball.direction = 'right-straight';
                    break;
            }
        }
    }

    get paddleLeft(): Paddle {
        if (!this._paddleLeft) this._paddleLeft = new Paddle(1, Math.floor((rendererHeight - paddleHeight) * 0.5));

        return this._paddleLeft;
    }

    get paddleRight(): Paddle {
        if (!this._paddleRight) this._paddleRight = new Paddle(rendererWidth - 2, Math.floor((rendererHeight - paddleHeight) * 0.5));

        return this._paddleRight;
    }

    get ball(): Ball {
        if (!this._ball) this._ball = new Ball(Math.floor((rendererWidth - 1) * 0.5), Math.floor(rendererHeight * 0.5));

        return this._ball;
    }

    get playerLeftScore() {
        return this._playerLeftScore;
    }

    set playerLeftScore(score: number) {
        this._playerLeftScore = score;

        this.score.set(pad(score, 3, '!') + pad(this._playerRightScore, 3, '!'));
    }

    get playerRightScore() {
        return this._playerRightScore;
    }

    set playerRightScore(score: number) {
        this._playerRightScore = score;

        this.score.set(pad(this._playerLeftScore, 3, '!') + pad(score, 3, '!'));
    }
}

export default PongBrain;
