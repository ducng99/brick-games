import { AudioTypes, playAudio } from '../../../libs/AudioHandler';
import { addGamepadConnectedListener, canGamepadVibrate, vibrateGamepad, isGamepadButtonDown, GamepadStandardButton, isGamepadStickNegative, GamepadStandardAxis, isGamepadStickPositive, addGamepadButtonDownListener, addGamepadButtonUpListener, removeGamepadConnectedListener, removeGamepadButtonDownListener, removeGamepadButtonUpListener } from '../../../libs/GamepadHandler';
import { addOnKeyDownListener, addOnKeyUpListener, isKeyDown, removeOnKeyDownListener, removeOnKeyUpListener } from '../../../libs/KeyboardHandler';
import { padLeft } from '../../../libs/utils';
import { ModalsInstance } from '../../../stores/ModalStore';
import { RendererMiniInstance, rendererMiniHeight } from '../../../stores/RendererMiniStore';
import { rendererHeight, rendererWidth } from '../../../stores/RendererStore';
import Brain from '../../libs/Brain';
import Ball from './Ball';
import Paddle, { paddleHeight } from './Paddle';

interface Player {
    readonly id: number;
    score: number;
    power: number;
}

const gamepadSettingsVersion = 1;

const paddleMoveDelay = 30;
const ballMoveDelayDefault = 80;

const playerMaxPower = 4;

class PongBrain extends Brain {
    private _paddleLeft?: Paddle;
    private _paddleRight?: Paddle;
    private _ball?: Ball;
    private _lastBallMoveFrame: DOMHighResTimeStamp = 0;

    private readonly _playerLeft: Player = { id: 1, score: 0, power: 0 };
    private readonly _playerRight: Player = { id: 2, score: 0, power: 0 };

    private _playerLeftPowerVibratingInterval = 0;
    private _playerRightPowerVibratingInterval = 0;
    private _playerLeftPowerTriggering = false;
    private _playerRightPowerTriggering = false;

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

        // Setup power triggers
        const onPowerKeyDown = addGamepadButtonDownListener(GamepadStandardButton.A, (gamepadIndex: number) => {
            if (this.gamepadHelper().getGamepadForPlayer(this._playerLeft.id) === gamepadIndex) {
                this.handlePowerKeyDown(this._playerLeft, gamepadIndex);
            } else if (this.gamepadHelper().getGamepadForPlayer(this._playerRight.id) === gamepadIndex) {
                this.handlePowerKeyDown(this._playerRight, gamepadIndex);
            }
        });

        const onPowerKeyUp = addGamepadButtonUpListener(GamepadStandardButton.A, (gamepadIndex: number) => {
            if (this.gamepadHelper().getGamepadForPlayer(this._playerLeft.id) === gamepadIndex) {
                this.handlePowerKeyUp(this._playerLeft);
            } else if (this.gamepadHelper().getGamepadForPlayer(this._playerRight.id) === gamepadIndex) {
                this.handlePowerKeyUp(this._playerRight);
            }
        });

        const onPowerKeyDownPlayerLeft = addOnKeyDownListener('Space', () => {
            this.handlePowerKeyDown(this._playerLeft);
        });

        const onPowerKeyUpPlayerLeft = addOnKeyUpListener('Space', () => {
            this.handlePowerKeyUp(this._playerLeft);
        });

        const onPowerKeyDownPlayerRight = addOnKeyDownListener('Enter', () => {
            this.handlePowerKeyDown(this._playerRight);
        });

        const onPowerKeyUpPlayerRight = addOnKeyUpListener('Enter', () => {
            this.handlePowerKeyUp(this._playerRight);
        });

        this.unsubscribers.push(() => {
            removeGamepadConnectedListener(this.onGamepadConnected);
            removeGamepadButtonDownListener(GamepadStandardButton.A, onPowerKeyDown);
            removeGamepadButtonUpListener(GamepadStandardButton.A, onPowerKeyUp);
            removeOnKeyDownListener('Space', onPowerKeyDownPlayerLeft);
            removeOnKeyUpListener('Space', onPowerKeyUpPlayerLeft);
            removeOnKeyDownListener('Enter', onPowerKeyDownPlayerRight);
            removeOnKeyUpListener('Enter', onPowerKeyUpPlayerRight);
        });

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

                    this._ballCollidedWithPaddle = this._playerRight.id;
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

                    this._ballCollidedWithPaddle = this._playerLeft.id;
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

                            this._ballCollidedWithPaddle = this._playerRight.id;
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

                            this._ballCollidedWithPaddle = this._playerLeft.id;
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

                            playAudio(AudioTypes.PickupCoin);
                        } else if (this.ball.x >= rendererWidth) {
                            this.restart();
                            this.playerLeftScore++;

                            playAudio(AudioTypes.PickupCoin);
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
        this._playerLeft.power = 0;
        this._playerRight.power = 0;

        clearInterval(this._playerLeftPowerVibratingInterval);
        clearInterval(this._playerRightPowerVibratingInterval);

        // Resets players' power on renderer
        for (let i = 0; i < rendererMiniHeight; i++) {
            RendererMiniInstance?.setBlock(0, i, false);
            RendererMiniInstance?.setBlock(3, i, false);
        }

        this._ball = undefined;
        this.ball.moveRelative(0, 0);

        this._canBallMove = false;
        this._ballMoveDelay = ballMoveDelayDefault + 50;
        this._ballCollidedWithPaddle = 0;

        this.state = 'started';
    }

    onBallCollideWithPaddle(playerID: number) {
        // Restore power ball speed change
        if (this._ballMoveDelay != ballMoveDelayDefault) {
            this._ballMoveDelay = ballMoveDelayDefault;
        }

        // Random chance of ball direction go straight
        if (this.ball.y !== 0 && this.ball.y !== rendererHeight - 1 && Math.random() <= 0.3) {
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

        // Power ball speed change
        if (this._playerLeftPowerTriggering && playerID === this._playerLeft.id) {
            this._ballMoveDelay *= 1 - 0.15 * this._playerLeft.power;
            this.playerLeftPower = 0;
            this.handlePowerKeyUp(this._playerLeft);
        } else if (this._playerRightPowerTriggering && playerID === this._playerRight.id) {
            this._ballMoveDelay *= 1 - 0.15 * this._playerRight.power;
            this.playerRightPower = 0;
            this.handlePowerKeyUp(this._playerRight);
        } else {
            // Vibrate gamepad of the colliding player
            // * We only vibrate if power key is not down as gamepad is already vibrating
            const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(playerID);
            if (gamepadIndex >= 0) {
                vibrateGamepad(gamepadIndex, 1.0, 150).catch(() => {});
            }
        }

        // Add power to the player
        switch (playerID) {
            case this._playerLeft.id:
                if (this.playerLeftPower < playerMaxPower) {
                    this.playerLeftPower++;
                }
                break;
            case this._playerRight.id:
                if (this.playerRightPower < playerMaxPower) {
                    this.playerRightPower++;
                }
                break;
            default:
                break;
        }

        // Play sound
        playAudio(AudioTypes.Hit);
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
                        this.gamepadHelper().pairGamepad(gamepadIndex, gamepadId, this._playerLeft.id, undefined, gamepadSettingsVersion);
                    },
                    closeAfterClick: true
                },
                {
                    text: 'Player Right',
                    onClick: () => {
                        this.gamepadHelper().pairGamepad(gamepadIndex, gamepadId, this._playerRight.id, undefined, gamepadSettingsVersion);
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
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(this._playerLeft.id);
        return isKeyDown('KeyW') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadUp, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickNegative(GamepadStandardAxis.LeftStickY, gamepadIndex));
    }

    shouldPlayerLeftMoveDown() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(this._playerLeft.id);
        return isKeyDown('KeyS') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadDown, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickPositive(GamepadStandardAxis.LeftStickY, gamepadIndex));
    }

    shouldPlayerRightMoveUp() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(this._playerRight.id);
        return isKeyDown('ArrowUp') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadUp, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickNegative(GamepadStandardAxis.LeftStickY, gamepadIndex));
    }

    shouldPlayerRightMoveDown() {
        const gamepadIndex = this.gamepadHelper().getGamepadForPlayer(this._playerRight.id);
        return isKeyDown('ArrowDown') ||
            (gamepadIndex >= 0 && isGamepadButtonDown(GamepadStandardButton.DPadDown, gamepadIndex)) ||
            (gamepadIndex >= 0 && isGamepadStickPositive(GamepadStandardAxis.LeftStickY, gamepadIndex));
    }

    handlePowerKeyDown(player: Player, gamepadIndex?: number) {
        switch (player.id) {
            case this._playerLeft.id:
                if (player.power > 0 && player.power <= playerMaxPower) {
                    this._playerLeftPowerTriggering = true;

                    if (typeof gamepadIndex === 'number') {
                        vibrateGamepad(gamepadIndex, 0.5, 100).catch(() => {});
                        this._playerLeftPowerVibratingInterval = setInterval(() => {
                            vibrateGamepad(gamepadIndex, 0.5, 100).catch(() => {});
                        }, 100);
                    }
                }
                break;
            case this._playerRight.id:
                if (player.power > 0 && player.power <= playerMaxPower) {
                    this._playerRightPowerTriggering = true;

                    if (typeof gamepadIndex === 'number') {
                        vibrateGamepad(gamepadIndex, 0.5, 100).catch(() => {});
                        this._playerRightPowerVibratingInterval = setInterval(() => {
                            vibrateGamepad(gamepadIndex, 0.5, 100).catch(() => {});
                        }, 100);
                    }
                }
                break;
            default:
                break;
        }
    }

    handlePowerKeyUp(player: Player) {
        switch (player.id) {
            case this._playerLeft.id:
                this._playerLeftPowerTriggering = false;
                clearInterval(this._playerLeftPowerVibratingInterval);
                break;
            case this._playerRight.id:
                this._playerRightPowerTriggering = false;
                clearInterval(this._playerRightPowerVibratingInterval);
                break;
            default:
                break;
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
        return this._playerLeft.score;
    }

    set playerLeftScore(score: number) {
        this._playerLeft.score = score;

        this.score.set(padLeft(score, 3, '!') + padLeft(this._playerRight.score, 3, '!'));
    }

    get playerRightScore() {
        return this._playerRight.score;
    }

    set playerRightScore(score: number) {
        this._playerRight.score = score;

        this.score.set(padLeft(this._playerLeft.score, 3, '!') + padLeft(score, 3, '!'));
    }

    get playerLeftPower() {
        return this._playerLeft.power;
    }

    set playerLeftPower(power: number) {
        if (power !== this._playerLeft.power) {
            this._playerLeft.power = power;

            for (let i = rendererMiniHeight - 1; i > rendererMiniHeight - 1 - playerMaxPower; i--) {
                RendererMiniInstance?.setBlock(0, i, (rendererMiniHeight - 1 - power) < i);
            }
        }
    }

    get playerRightPower() {
        return this._playerRight.power;
    }

    set playerRightPower(power: number) {
        if (power !== this._playerRight.power) {
            this._playerRight.power = power;

            for (let i = rendererMiniHeight - 1; i > rendererMiniHeight - 1 - playerMaxPower; i--) {
                RendererMiniInstance?.setBlock(3, i, (rendererMiniHeight - 1 - power) < i);
            }
        }
    }
}

export default PongBrain;
