import { AudioTypes, getAudioPlayer } from '../../libs/AudioHandler';
import { isGamepadButtonDown, GamepadStandardButton, isGamepadStickNegative, GamepadStandardAxis, isGamepadStickPositive, vibrateGamepad, getAllGamepadIndexes } from '../../libs/GamepadHandler';
import { isKeyDown } from '../../libs/KeyboardHandler';
import { padLeft, clamp } from '../../libs/utils';
import { RendererMiniInstance } from '../../stores/RendererMiniStore';
import { rendererHeight, rendererWidth } from '../../stores/RendererStore';
import Brain from '../libs/Brain';
import Explosion from '../libs/common-entities/Explosion';
import WipeBottomToTopTransition from '../libs/common-entities/WipeBottomToTopTransition';
import Bullet from './Bullet';
import EnemyBrick from './EnemyBricks';
import Player from './Player';

const playerDefaultY = rendererHeight - 2;
const playerDefaultX = Math.floor((rendererWidth - 3) * 0.5);

const playerMoveDelay = 50;
const shootDelay = 200;
const bulletMoveDelay = 4;
const enemyMoveDelay = 1000;

class ShootingBricksBrain extends Brain {
    private _player?: Player;
    private _health = 4;
    private _currentScore = 0;
    private readonly _bullets: Bullet[] = [];
    private readonly _enemies: EnemyBrick[] = [];
    private _explosion?: Explosion;
    private _transition?: WipeBottomToTopTransition;

    private _lastShoot = 0;
    private _lastBulletMove = 0;
    private _lastEnemyMove = 0;

    setRendererWidthHeight(): [width: number, height: number] {
        return [10, 20];
    }

    start() {
        // Show health
        this.health = 4;

        this.restart();
        return super.start();
    }

    update = (timestamp: DOMHighResTimeStamp) => {
        if (this.state === 'started' && (isKeyDown('Space') || isGamepadButtonDown(GamepadStandardButton.A))) {
            this.state = 'running';
            this.lastFrame = timestamp;
            this._lastShoot = timestamp;
            this._lastBulletMove = timestamp;
            this._lastEnemyMove = timestamp;
        }

        if (this.state === 'running') {
            if (this._explosion) {
                if (this._explosion.AnimationState === 'finished') {
                    this._explosion.clear();
                    this._explosion = undefined;
                    this._transition = new WipeBottomToTopTransition(100);
                } else {
                    this._explosion.update(timestamp);
                }

                return;
            }

            if (this._transition) {
                if (this._transition.AnimationState === 'finished') {
                    this._transition.clear();

                    if (this._health > 0) {
                        this.restart();
                    } else {
                        this.stop();
                    }
                } else {
                    this._transition.update(timestamp);
                }

                return;
            }

            const playerMoveDelta = timestamp - this.lastFrame;

            if (playerMoveDelta >= playerMoveDelay) {
                const steps = Math.floor(playerMoveDelta / playerMoveDelay);

                if (this.shouldPlayerMoveLeft()) {
                    this.player.moveLeft(steps);
                } else if (this.shouldPlayerMoveRight()) {
                    this.player.moveRight(steps);
                }

                this.lastFrame = timestamp;
            }

            const bulletMoveDelta = timestamp - this._lastBulletMove;

            if (bulletMoveDelta >= bulletMoveDelay) {
                const steps = Math.floor(bulletMoveDelta / bulletMoveDelay);

                // Loop backwards so we won't skip an entry after splice
                for (let i = this._bullets.length - 1; i >= 0; i--) {
                    let isEnemyHit = false;

                    for (let k = 0; k < steps && !isEnemyHit; k++) {
                        const eIndex = this._enemies.findIndex((enemy) => this._bullets[i].isCollidingBox(enemy, 0, -k));

                        if (eIndex > -1) {
                            this._enemies.splice(eIndex, 1)[0].clear();
                            this._bullets.splice(i, 1)[0].clear();

                            this.currentScore += 100;
                            isEnemyHit = true;
                        }
                    }

                    if (!isEnemyHit) {
                        this._bullets[i].moveRelative(0, -steps);

                        if (this._bullets[i].y < 0) {
                            this._bullets.splice(i, 1);
                        }
                    }
                }

                this._lastBulletMove = timestamp;
            }

            const gamepadIndexShot = { gamepadIndex: -1 };
            if (isKeyDown('Space') || isGamepadButtonDown(GamepadStandardButton.A, undefined, gamepadIndexShot)) {
                const shootDelta = timestamp - this._lastShoot;

                if (shootDelta >= shootDelay) {
                    // Can't utilise the steps here, because we don't know if player was shooting in the previous frames
                    this._bullets.push(new Bullet(this.player.x + 1, this.player.y - 1));

                    // Vibrate gamepad on shoot, only when player is using gamepad
                    if (gamepadIndexShot.gamepadIndex >= 0) {
                        vibrateGamepad(gamepadIndexShot.gamepadIndex, 1.0, 120).catch(() => {});
                    }

                    // Play sound on shoot
                    getAudioPlayer(AudioTypes.LaserShoot)?.play();
                    this._lastShoot = timestamp;
                }
            } else {
                // Allow finger-jamming button shooting. It's player's choice if they want to shoot fast.
                this._lastShoot = 0;
            }

            const enemyMoveDelta = timestamp - this._lastEnemyMove;
            if (enemyMoveDelta >= enemyMoveDelay) {
                const steps = Math.floor(enemyMoveDelta / enemyMoveDelay);

                // Add new enemy bricks
                for (let s = steps - 1, page = steps / rendererHeight; s >= steps - Math.floor((page - Math.floor(page)) * rendererHeight); s--) {
                    for (let i = 0; i < rendererWidth; i++) {
                        if (Math.random() < 0.3) {
                            // We want to loop in reverse, so we use unshift instead of push
                            this._enemies.unshift(new EnemyBrick(i, -1 - s));
                        }
                    }
                }

                // Move all enemies down
                for (let i = this._enemies.length - 1; i >= 0; i--) {
                    let isEnemyHit = false;

                    for (let s = 0; s < steps && !isEnemyHit; s++) {
                        const bIndex = this._bullets.findIndex((bullet) => this._enemies[i].isCollidingBox(bullet, 0, s));

                        if (bIndex > -1) {
                            this._bullets.splice(bIndex, 1)[0].clear();
                            this._enemies.splice(i, 1)[0].clear();

                            this.currentScore += 100;
                            isEnemyHit = true;
                        }
                    }

                    if (!isEnemyHit) {
                        this._enemies[i].moveRelative(0, steps);

                        // If any enemy brick is at the bottom, game over
                        if (this._enemies[i].y >= rendererHeight - 2) {
                            this._health--;
                            this.createExplosion(this.player.x, this.player.y);
                        }
                    }
                }

                this._lastEnemyMove = timestamp;
            }
        }
    };

    stop() {
        this._player = undefined;
        this._bullets.length = 0;
        this._enemies.length = 0;
        this._explosion = undefined;
        this._transition = undefined;

        return super.stop();
    }

    restart() {
        this._player = undefined;
        this._bullets.length = 0;
        this._enemies.length = 0;
        this._explosion = undefined;
        this._transition = undefined;

        // Setup player
        this.player.moveRelative(0, 0);

        this.state = 'started';
    }

    shouldPlayerMoveLeft() {
        return isKeyDown('ArrowLeft') || isGamepadButtonDown(GamepadStandardButton.DPadLeft) || isGamepadStickNegative(GamepadStandardAxis.LeftStickX);
    }

    shouldPlayerMoveRight() {
        return isKeyDown('ArrowRight') || isGamepadButtonDown(GamepadStandardButton.DPadRight) || isGamepadStickPositive(GamepadStandardAxis.LeftStickX);
    }

    createExplosion = (x: number, y: number) => {
        y -= 1;

        const eX = x + Math.min(0, rendererWidth - (x + 5)) + Math.max(0, -x);
        const eY = y + Math.min(0, rendererHeight - (y + 5)) + Math.max(0, -y);
        this._explosion = new Explosion(eX, eY);

        getAllGamepadIndexes().forEach(index => {
            vibrateGamepad(index, 1.0, 1000).catch(() => {});
        });

        getAudioPlayer(AudioTypes.Explosion)?.play();
    };

    get player(): Player {
        if (!this._player) {
            this._player = new Player(playerDefaultX, playerDefaultY);
        }

        return this._player;
    }

    get health() {
        return this._health;
    }

    set health(value: number) {
        this._health = value;

        for (let i = 0; i < this._health; i++) {
            RendererMiniInstance?.setBlock(i, 0, i < this._health);
        }
    }

    get currentScore() {
        return this._currentScore;
    }

    set currentScore(score: number) {
        this._currentScore = score;
        this.hiScoreStore.update(hiScore => hiScore > score ? hiScore : score);
        this.score.set(padLeft(clamp(score ?? 0, 0, 999999), 3));
    };
}

export default ShootingBricksBrain;
