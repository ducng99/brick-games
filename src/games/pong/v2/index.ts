import { addGamepadConnectedListener, canGamepadVibrate, vibrateGamepad, isGamepadButtonDown, GamepadStandardButton, isGamepadStickNegative, GamepadStandardAxis, isGamepadStickPositive } from '../../../libs/GamepadHandler';
import { isKeyDown } from '../../../libs/KeyboardHandler';
import { padLeft } from '../../../libs/utils';
import { ModalsInstance } from '../../../stores/ModalStore';
import { rendererHeight, rendererWidth } from '../../../stores/RendererStore';
import Brain from '../../libs/Brain';
import Ball from './Ball';
import Paddle, { paddleHeight } from './Paddle';

const gamepadSettingsVersion = 1;

const playerLeftID = 1;
const playerRightID = 2;

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
    private _ballCollidedWithPaddle = 0;

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

        // Setup gamepad controls
        addGamepadConnectedListener(this.onGamepadConnected);

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
            const delta = timestamp - this.lastFrame;

            if (delta >= paddleMoveDelay) {
                const steps = Math.floor(delta / paddleMoveDelay);
                const [ballFutureX, ballFutureY] = this.ball.getFuturePosition();

                let paddleRightMoved = 0;

                if (this.shouldPlayerRightMoveUp()) {
                    paddleRightMoved = this.paddleRight.moveUp(steps);
                } else if (this.shouldPlayerRightMoveDown()) {
                    paddleRightMoved = this.paddleRight.moveDown(steps);
                }

                if (paddleRightMoved !== 0 && this.ball.isCollidingBox(this.paddleRight, ballFutureX, ballFutureY)) {
                    this.ball.moveRelative(paddleRightMoved, 0);

                    if (paddleRightMoved > 0) {
                        this.ball.direction = 'down-left';
                    } else {
                        this.ball.direction = 'up-left';
                    }

                    this._ballCollidedWithPaddle = playerRightID;
                }

                let paddleLeftMoved = 0;

                if (this.shouldPlayerLeftMoveUp()) {
                    paddleLeftMoved = this.paddleLeft.moveUp(steps);
                } else if (this.shouldPlayerLeftMoveDown()) {
                    paddleLeftMoved = this.paddleLeft.moveDown(steps);
                }

                if (paddleLeftMoved !== 0 && this.ball.isCollidingBox(this.paddleLeft, ballFutureX, ballFutureY)) {
                    this.ball.moveRelative(paddleLeftMoved, 0);

                    if (paddleLeftMoved > 0) {
                        this.ball.direction = 'down-right';
                    } else {
                        this.ball.direction = 'up-right';
                    }

                    this._ballCollidedWithPaddle = playerLeftID;
                }

                this.lastFrame = timestamp;
            }

            // Ball move in different speed compared to paddles
            const ballDelta = timestamp - this._lastBallMoveFrame;

            if (ballDelta >= this._ballMoveDelay) {
                if (!this._canBallMove && (isKeyDown('Space') || isGamepadButtonDown(GamepadStandardButton.A))) {
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
                                    break;
                                case 'down-right':
                                    this.ball.direction = 'down-left';
                                    break;
                                default:
                                    this.ball.direction = Math.random() > 0.5 ? 'up-left' : 'down-left';
                                    break;
                            }

                            this._ballCollidedWithPaddle = playerRightID;
                        } else if (this.ball.isCollidingBox(this.paddleLeft, ballFutureX, ballFutureY)) {
                            switch (this.ball.direction) {
                                case 'up-left':
                                    this.ball.direction = 'up-right';
                                    break;
                                case 'down-left':
                                    this.ball.direction = 'down-right';
                                    break;
                                default:
                                    this.ball.direction = Math.random() > 0.5 ? 'up-right' : 'down-right';
                                    break;
                            }

                            this._ballCollidedWithPaddle = playerLeftID;
                        }

                        if (this._ballCollidedWithPaddle > 0) {
                            this.onBallCollideWithPaddle(this._ballCollidedWithPaddle);
                            this._ballCollidedWithPaddle = 0;
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

    onBallCollideWithPaddle(playerID: number) {
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

        // Vibrate gamepad of the colliding player
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerID);
        if (gamepadIndex >= 0) {
            vibrateGamepad(gamepadIndex, 1.0, 150).catch(() => {});
        }
    }

    onGamepadConnected = (gamepadIndex: number, gamepadId: string) => {
        const gamepadSettings = this.gamepadHelper().settings;

        if (gamepadIndex in gamepadSettings &&
            gamepadSettings[gamepadIndex]._version >= gamepadSettingsVersion &&
            gamepadSettings[gamepadIndex].gamepadId === gamepadId) {
            return;
        }

        if (ModalsInstance) {
            let pulseGamepadInterval = 0;
            const canVibrate = canGamepadVibrate(gamepadIndex);

            ModalsInstance.showModal('Gamepad connected!', `[${gamepadIndex}] ${gamepadId}<br/><br/>Use it for:`, [
                {
                    text: 'Player Left',
                    onClick: () => {
                        this.gamepadHelper().pairGamepad(gamepadIndex, gamepadId, playerLeftID, undefined, gamepadSettingsVersion);
                    },
                    closeAfterClick: true
                },
                {
                    text: 'Player Right',
                    onClick: () => {
                        this.gamepadHelper().pairGamepad(gamepadIndex, gamepadId, playerRightID, undefined, gamepadSettingsVersion);
                    },
                    closeAfterClick: true
                },
                {
                    text: 'None',
                    onClick: () => {
                        this.gamepadHelper().pairGamepad(gamepadIndex, gamepadId, 0, undefined, gamepadSettingsVersion);
                    },
                    closeAfterClick: true
                }
            ],
            canVibrate ? () => (pulseGamepadInterval = setInterval(() => vibrateGamepad(gamepadIndex, 0.5, 500).catch(() => {}), 1000)) : undefined,
            canVibrate ? () => { clearInterval(pulseGamepadInterval); } : undefined);
        }
    };

    shouldPlayerLeftMoveUp() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerLeftID);
        return isKeyDown('KeyW') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadUp, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickNegative(GamepadStandardAxis.LeftStickY, gamepadIndex));
    }

    shouldPlayerLeftMoveDown() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerLeftID);
        return isKeyDown('KeyS') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadDown, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickPositive(GamepadStandardAxis.LeftStickY, gamepadIndex));
    }

    shouldPlayerRightMoveUp() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerRightID);
        return isKeyDown('ArrowUp') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadUp, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickNegative(GamepadStandardAxis.LeftStickY, gamepadIndex));
    }

    shouldPlayerRightMoveDown() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerRightID);
        return isKeyDown('ArrowDown') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadDown, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickPositive(GamepadStandardAxis.LeftStickY, gamepadIndex));
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

        this.score.set(padLeft(score, 3, '!') + padLeft(this._playerRightScore, 3, '!'));
    }

    get playerRightScore() {
        return this._playerRightScore;
    }

    set playerRightScore(score: number) {
        this._playerRightScore = score;

        this.score.set(padLeft(this._playerLeftScore, 3, '!') + padLeft(score, 3, '!'));
    }
}

export default PongBrain;
