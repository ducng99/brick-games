import { AudioTypes, getAudioPlayer } from '../../libs/AudioHandler';
import { GamepadStandardAxis, GamepadStandardButton, addGamepadConnectedListener, canGamepadVibrate, isGamepadButtonDown, isGamepadStickNegative, isGamepadStickPositive, removeGamepadConnectedListener, vibrateGamepad } from '../../libs/GamepadHandler';
import { isKeyDown } from '../../libs/KeyboardHandler';
import { padLeft } from '../../libs/utils';
import { ModalsInstance } from '../../stores/ModalStore';
import { rendererHeight, rendererWidth } from '../../stores/RendererStore';
import Brain from '../libs/Brain';
import Ball from './Ball';
import Paddle, { paddleWidth } from './Paddle';

const gamepadSettingsVersion = 1;

const playerBottomID = 1;
const playerTopID = 2;

const paddleMoveDelay = 50;
const ballMoveDelayDefault = 100;

class PongBrain extends Brain {
    private _paddleTop?: Paddle;
    private _paddleBottom?: Paddle;
    private _ball?: Ball;
    private _lastBallMoveFrame: DOMHighResTimeStamp = 0;

    private _playerTopScore = 0;
    private _playerBottomScore = 0;

    private _canBallMove = false;
    // Initial speed is slower as it starts from middle screen
    private _ballMoveDelay = ballMoveDelayDefault + 50;
    private _ballCollidedWithPaddle = 0;

    setRendererWidthHeight(): [width: number, height: number] {
        return [10, 20];
    }

    start() {
        // Initialise paddles once on game start
        this.paddleTop.moveRelative(0, 0);
        this.paddleBottom.moveRelative(0, 0);

        // Setup score text
        this.playerBottomScore = 0;
        this.playerTopScore = 0;

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

                let paddleBottomMoved = 0;

                if (this.shouldPlayerBottomMoveLeft()) {
                    paddleBottomMoved = this.paddleBottom.moveLeft(steps);
                } else if (this.shouldPlayerBottomMoveRight()) {
                    paddleBottomMoved = this.paddleBottom.moveRight(steps);
                }

                if (paddleBottomMoved !== 0 && this.ball.isCollidingBox(this.paddleBottom, ballFutureX, ballFutureY)) {
                    this.ball.moveRelative(paddleBottomMoved, 0);

                    if (paddleBottomMoved > 0) {
                        this.ball.direction = 'up-right';
                    } else {
                        this.ball.direction = 'up-left';
                    }

                    this._ballCollidedWithPaddle = playerBottomID;
                }

                let paddleTopMoved = 0;

                if (this.shouldPlayerTopMoveLeft()) {
                    paddleTopMoved = this.paddleTop.moveLeft(steps);
                } else if (this.shouldPlayerTopMoveRight()) {
                    paddleTopMoved = this.paddleTop.moveRight(steps);
                }

                if (paddleTopMoved !== 0 && this.ball.isCollidingBox(this.paddleTop, ballFutureX, ballFutureY)) {
                    this.ball.moveRelative(paddleTopMoved, 0);

                    if (paddleTopMoved > 0) {
                        this.ball.direction = 'down-right';
                    } else {
                        this.ball.direction = 'down-left';
                    }

                    this._ballCollidedWithPaddle = playerTopID;
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
                                    break;
                                case 'down-right':
                                    this.ball.direction = 'up-right';
                                    break;
                                default:
                                    this.ball.direction = Math.random() > 0.5 ? 'up-left' : 'up-right';
                                    break;
                            }

                            this._ballCollidedWithPaddle = playerBottomID;
                        } else if (this.ball.isCollidingBox(this.paddleTop, ballFutureX, ballFutureY)) {
                            switch (this.ball.direction) {
                                case 'up-left':
                                    this.ball.direction = 'down-left';
                                    break;
                                case 'up-right':
                                    this.ball.direction = 'down-right';
                                    break;
                                default:
                                    this.ball.direction = Math.random() > 0.5 ? 'down-left' : 'down-right';
                                    break;
                            }

                            this._ballCollidedWithPaddle = playerTopID;
                        }

                        if (this._ballCollidedWithPaddle > 0) {
                            this.onBallCollideWithPaddle(this._ballCollidedWithPaddle);
                            this._ballCollidedWithPaddle = 0;
                        }

                        this.ball.update();

                        // Checks if ball is out & add score
                        if (this.ball.y < 0) {
                            this.restart();
                            this.playerBottomScore++;

                            getAudioPlayer(AudioTypes.PickupCoin)?.play();
                        } else if (this.ball.y >= rendererHeight) {
                            this.restart();
                            this.playerTopScore++;

                            getAudioPlayer(AudioTypes.PickupCoin)?.play();
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

        removeGamepadConnectedListener(this.onGamepadConnected);

        return super.stop();
    }

    restart() {
        this._ball = undefined;
        this.ball.moveRelative(0, 0);

        this._canBallMove = false;
        this._ballMoveDelay = ballMoveDelayDefault + 50;
        this._ballCollidedWithPaddle = 0;

        this.state = 'started';
    }

    onBallCollideWithPaddle(playerID: number) {
        // Random chance of ball speed change
        if (this._ballMoveDelay != ballMoveDelayDefault) {
            this._ballMoveDelay = ballMoveDelayDefault;
        } else if (Math.random() <= 0.2) {
            this._ballMoveDelay -= 50;
        }

        // Random chance of ball direction go straight
        if (this.ball.x != 0 && this.ball.x != rendererWidth - 1 && Math.random() <= 0.3) {
            switch (this.ball.direction) {
                case 'down-left':
                case 'down-right':
                    this.ball.direction = 'down-straight';
                    break;
                case 'up-left':
                case 'up-right':
                    this.ball.direction = 'up-straight';
                    break;
            }
        }

        // Vibrate gamepad of the colliding player
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerID);
        if (gamepadIndex >= 0) {
            vibrateGamepad(gamepadIndex, 1.0, 120).catch(() => {});
        }

        // Play sound
        getAudioPlayer(AudioTypes.Hit)?.play();
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
                    text: 'Player Bottom',
                    onClick: () => {
                        this.gamepadHelper().pairGamepad(gamepadIndex, gamepadId, playerBottomID, undefined, gamepadSettingsVersion);
                    },
                    closeAfterClick: true
                },
                {
                    text: 'Player Top',
                    onClick: () => {
                        this.gamepadHelper().pairGamepad(gamepadIndex, gamepadId, playerTopID, undefined, gamepadSettingsVersion);
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

    shouldPlayerBottomMoveLeft() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerBottomID);
        return isKeyDown('ArrowLeft') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadLeft, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickNegative(GamepadStandardAxis.LeftStickX, gamepadIndex));
    }

    shouldPlayerBottomMoveRight() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerBottomID);
        return isKeyDown('ArrowRight') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadRight, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickPositive(GamepadStandardAxis.LeftStickX, gamepadIndex));
    }

    shouldPlayerTopMoveLeft() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerTopID);
        return isKeyDown('KeyA') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadLeft, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickNegative(GamepadStandardAxis.LeftStickX, gamepadIndex));
    }

    shouldPlayerTopMoveRight() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerTopID);
        return isKeyDown('KeyD') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadRight, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickPositive(GamepadStandardAxis.LeftStickX, gamepadIndex));
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

        this.score.set(padLeft(score, 3, '!') + padLeft(this._playerBottomScore, 3, '!'));
    }

    get playerBottomScore() {
        return this._playerBottomScore;
    }

    set playerBottomScore(score: number) {
        this._playerBottomScore = score;

        this.score.set(padLeft(this._playerTopScore, 3, '!') + padLeft(score, 3, '!'));
    }
}

export default PongBrain;
