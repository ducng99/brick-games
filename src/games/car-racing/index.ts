import { isKeyDown, addOnKeyDownListener, removeOnKeyDownListener } from '../../libs/KeyboardHandler';
import { rendererHeight, rendererWidth } from '../../stores/RendererStore';
import Brain from '../libs/Brain';
import Wall from './Wall';
import Car from './Car';
import Explosion from '../libs/common-entities/Explosion';
import WipeBottomToTopTransition from '../libs/common-entities/WipeBottomToTopTransition';
import { clamp, pad, randomInt } from '../../libs/utils';
import { RendererMiniInstance } from '../../stores/RendererMiniStore';

const carHeight = 4;
const carWidth = 3;
const playerCarY = rendererHeight - carHeight;
const maxSpeed = 170;

class CarRacingBrain extends Brain {
    private _player?: Car;
    private _health: number = 4;
    private readonly _walls: Wall[] = [];
    private readonly _otherCars: Car[] = [];
    private _speed: number = 0;
    private _explosion?: Explosion;
    private _transition?: WipeBottomToTopTransition;
    private _currentScore: number = 0;

    setRendererWidthHeight(): [width: number, height: number] {
        return [10, 20];
    }

    start() {
        // Setup keyboard listeners
        addOnKeyDownListener('ArrowLeft', this.playerMoveLeft);
        addOnKeyDownListener('ArrowRight', this.playerMoveRight);

        // Show health
        for (let i = 0; i < this._health; i++) {
            RendererMiniInstance?.setBlock(i, 0, true);
        }

        this.restart();

        return super.start();
    }

    update = (timestamp: DOMHighResTimeStamp) => {
        if (this.state === 'started' && isKeyDown('Space')) {
            this.state = 'running';
            this.lastFrame = timestamp;
        }

        if (this.state === 'running') {
            if (this._explosion) {
                if (this._explosion.AnimationState === 'finished') {
                    this._explosion.clear();
                    this._explosion = undefined;
                    this._transition = new WipeBottomToTopTransition(this._health == 0 ? 100 : undefined);
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

            let actualSpeed = this._speed;

            if (isKeyDown('Space')) {
                if (this._speed + 150 < maxSpeed) {
                    actualSpeed += 150;
                } else {
                    actualSpeed = maxSpeed;
                }
            }

            const delta = timestamp - this.lastFrame;
            const shouldUpdateTime = 200 - actualSpeed * 1;

            if (delta >= shouldUpdateTime) {
                const steps = Math.floor(delta / shouldUpdateTime);

                this._walls.forEach((wall) => {
                    wall.moveRelative(0, 1 * steps);

                    if (wall.y >= rendererHeight) {
                        wall.moveRelative(0, -25);
                    }
                });

                // Loop backwards so we won't skip an entry after splice
                for (let i = this._otherCars.length - 1; i >= 0; i--) {
                    const car = this._otherCars[i];
                    car.moveRelative(0, 1 * steps);

                    // Remove car if it's out of screen
                    if (car.y >= rendererHeight) {
                        this._otherCars.splice(i, 1);
                    } else {
                        // Checks collision with player
                        if (car.isCollidingBox(this.player)) {
                            this.health -= 1;
                            this.createExplosion(car.x, car.y);
                        } else if (car.y == playerCarY + 1) {
                            this.currentScore += 100 + Math.floor(actualSpeed / 10);

                            if (this._speed < maxSpeed) {
                                this._speed++;
                            }
                        }
                    }
                }

                // Generate new car if last car's Y is at least 5 blocks away from the top
                const lastCarY = this._otherCars.at(-1)?.y ?? 0;
                if (lastCarY >= 5) {
                    const x = -1 + randomInt(1, Math.floor((rendererWidth - 4) / carWidth)) * carWidth;
                    this._otherCars.push(new Car(x, -carHeight + lastCarY - 5));
                }

                this.lastFrame = timestamp;
            }
        }
    };

    stop() {
        this._player = undefined;
        this._walls.length = 0;
        this._otherCars.length = 0;
        this._explosion = undefined;
        this._transition = undefined;

        removeOnKeyDownListener('ArrowLeft', this.playerMoveLeft);
        removeOnKeyDownListener('ArrowRight', this.playerMoveRight);

        return super.stop();
    }

    restart = () => {
        this._player = undefined;
        this._walls.length = 0;
        this._otherCars.length = 0;
        this._explosion = undefined;
        this._transition = undefined;

        // Setup walls
        for (let i = -2; i < rendererHeight; i += 5) {
            this._walls.push(new Wall(0, i));
            this._walls.push(new Wall(9, i));
        }

        // Setup other cars
        // Randomly choose lane
        const x = -1 + randomInt(1, Math.floor((rendererWidth - 4) / carWidth)) * carWidth;
        this._otherCars.push(new Car(x, -carHeight));

        // Setup player car
        this.player.moveRelative(0, 0);

        this.state = 'started';
    };

    playerMoveLeft = () => {
        if (!this._explosion && !this._transition && this.state === 'running') {
            const x = -carWidth;

            if (this.player.x + x >= 2) {
                this.player.moveRelative(x, 0);
            }

            // Checks collision with other cars
            this._otherCars.forEach((car) => {
                if (car.isCollidingBox(this.player)) {
                    this.health -= 1;
                    this.createExplosion(car.x, car.y);
                }
            });
        }
    };

    playerMoveRight = () => {
        if (!this._explosion && !this._transition && this.state === 'running') {
            const x = carWidth;

            if (this.player.x + x <= rendererWidth - carWidth - 2) {
                this.player.moveRelative(x, 0);
            }

            // Checks collision with other cars
            this._otherCars.forEach((car) => {
                if (car.isCollidingBox(this.player)) {
                    this.health -= 1;
                    this.createExplosion(car.x, car.y);
                }
            });
        }
    };

    createExplosion = (x: number, y: number) => {
        y -= 1;

        const eX = x + Math.min(0, rendererWidth - (x + 5)) + Math.max(0, -x);
        const eY = y + Math.min(0, rendererHeight - (y + 5)) + Math.max(0, -y);
        this._explosion = new Explosion(eX, eY);
    };

    get currentScore() {
        return this._currentScore;
    }

    set currentScore(score: number) {
        this._currentScore = score;
        this.hiScoreStore.set(score);
        this.score.set(pad(clamp(score ?? 0, 0, 999999), 3));
    };

    get player(): Car {
        if (!this._player) this._player = new Car(2, playerCarY);

        return this._player;
    }

    get health(): number {
        return this._health;
    }

    private set health(health: number) {
        if (health != this._health) {
            const oldHealth = this._health;
            this._health = health;

            RendererMiniInstance?.setBlock(Math.min(health, oldHealth), 0, health > oldHealth);
        }
    }
}

export default CarRacingBrain;
