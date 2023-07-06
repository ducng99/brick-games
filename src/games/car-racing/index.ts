import { get } from 'svelte/store';
import { isKeyDown, addOnKeyDownListener, removeOnKeyDownListener } from '../../libs/KeyboardHandler';
import { height as screenHeight, width as screenWidth } from '../../stores/RendererStore';
import Brain from '../libs/Brain';
import Wall from './Wall';
import Car from './Car';
import Explosion from '../libs/common-entities/Explosion';
import WipeBottomToTopTransition from '../libs/common-entities/WipeBottomToTopTransition';
import { randomInt } from '../../libs/Utils';

const carHeight = 4;
const carWidth = 3;
const playerCarY = get(screenHeight) - carHeight;
const maxSpeed = 170;

class CarRacingBrain extends Brain {
    private _player?: Car;
    private _health: number = 4;
    private readonly _walls: Wall[] = [];
    private readonly _otherCars: Car[] = [];
    private _speed: number = 0;
    private _explosion?: Explosion;
    private _transition?: WipeBottomToTopTransition;

    get player(): Car {
        if (!this._player) this._player = new Car(2, playerCarY);

        return this._player;
    }

    start = () => {
        // Setup keyboard listeners
        addOnKeyDownListener('ArrowLeft', this.playerMoveLeft);
        addOnKeyDownListener('ArrowRight', this.playerMoveRight);

        // Show health
        for (let i = 0; i < this._health; i++) {
            this.rendererMini?.setBlock(i, 0, true);
        }

        this.restart();

        return super.start();
    };

    update = () => {
        if (this.state === 'started' && isKeyDown('Space')) {
            this.state = 'running';
            this.lastFrame = performance.now();
        }

        if (this.state === 'running') {
            if (this._explosion) {
                if (this._explosion.AnimationState === 'finished') {
                    this._explosion.clear();
                    this._explosion = undefined;
                    this._transition = new WipeBottomToTopTransition(this._health == 0 ? 100 : undefined);
                } else {
                    this._explosion.update();
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
                    this._transition.update();
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

            const delta = performance.now() - this.lastFrame;
            const shouldUpdateTime = 200 - actualSpeed * 1;

            if (delta >= shouldUpdateTime) {
                const steps = Math.floor(delta / shouldUpdateTime);

                this._walls.forEach((wall) => {
                    wall.moveRelative(0, 1 * steps);

                    if (wall.y >= get(screenHeight)) {
                        wall.moveRelative(0, -25);
                    }
                });

                // Loop backwards so we won't skip an entry after splice
                for (let i = this._otherCars.length - 1; i >= 0; i--) {
                    const car = this._otherCars[i];
                    car.moveRelative(0, 1 * steps);

                    // Remove car if it's out of screen
                    if (car.y >= get(screenHeight)) {
                        this._otherCars.splice(i, 1);
                    } else {
                        // Checks collision with player
                        if (car.isCollidingBox(this.player)) {
                            this.health -= 1;
                            this._explosion = new Explosion(car.x, car.y - 1);
                        } else if (car.y == playerCarY + 1) {
                            this._score.update(score => score + 100 + Math.floor(actualSpeed / 10));

                            if (this._speed < maxSpeed) {
                                this._speed++;
                            }
                        }
                    }
                }

                // Generate new car if last car's Y is at least 5 blocks away from the top
                const lastCarY = this._otherCars.at(-1)?.y ?? 0;
                if (lastCarY >= 5) {
                    const x = -1 + randomInt(1, Math.floor((get(screenWidth) - 4) / carWidth)) * carWidth;
                    this._otherCars.push(new Car(x, -carHeight + lastCarY - 5));
                }

                this.lastFrame = performance.now();
            }
        }
    };

    stop = () => {
        this._player = undefined;
        this._walls.length = 0;
        this._otherCars.length = 0;
        this._explosion = undefined;
        this._transition = undefined;

        removeOnKeyDownListener('ArrowLeft', this.playerMoveLeft);
        removeOnKeyDownListener('ArrowRight', this.playerMoveRight);

        return super.stop();
    };

    restart = () => {
        this._player = undefined;
        this._walls.length = 0;
        this._otherCars.length = 0;
        this._explosion = undefined;
        this._transition = undefined;

        // Setup walls
        for (let i = -2; i < get(screenHeight); i += 5) {
            this._walls.push(new Wall(0, i));
            this._walls.push(new Wall(9, i));
        }

        // Setup other cars
        // Randomly choose lane
        const x = -1 + randomInt(1, Math.floor((get(screenWidth) - 4) / carWidth)) * carWidth;
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
                    this._explosion = new Explosion(car.x, car.y - 1);
                }
            });
        }
    };

    playerMoveRight = () => {
        if (!this._explosion && !this._transition && this.state === 'running') {
            const x = carWidth;

            if (this.player.x + x <= get(screenWidth) - carWidth - 2) {
                this.player.moveRelative(x, 0);
            }

            // Checks collision with other cars
            this._otherCars.forEach((car) => {
                if (car.isCollidingBox(this.player)) {
                    this.health -= 1;
                    this._explosion = new Explosion(car.x, car.y - 1);
                }
            });
        }
    };

    get health(): number {
        return this._health;
    }

    private set health(health: number) {
        if (health != this._health) {
            const oldHealth = this._health;
            this._health = health;

            this.rendererMini?.setBlock(Math.min(health, oldHealth), 0, health > oldHealth);
        }
    }
}

export default CarRacingBrain;
