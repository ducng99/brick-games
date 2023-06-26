import { get } from 'svelte/store';
import { isKeyDown, addOnKeyDownListener, removeOnKeyDownListener } from '../../libs/KeyboardHandler';
import { height as screenHeight } from '../../stores/RendererStore';
import Brain from '../libs/Brain';
import Wall from './Wall';
import Car from './Car';
import Explosion from '../libs/common-entities/Explosion';

const carHeight = 4;
const playerCarY = 16;
const maxSpeed = 170;

class CarRacingBrain extends Brain {
    private _player?: Car;
    private readonly _walls: Wall[] = [];
    private readonly _otherCars: Car[] = [];
    private _speed: number = 0;
    private _explosion: Explosion | undefined;

    get player(): Car {
        if (!this._player) this._player = new Car(2, playerCarY);

        return this._player;
    }

    start = () => {
        // Setup walls
        for (let i = 0; i < 5; i++) {
            this._walls.push(new Wall(0, -i * 5 - 3));
            this._walls.push(new Wall(9, -i * 5 - 3));
        }

        // Setup other cars
        // Randomly choose left or right lane
        const x = Math.random() > 0.5 ? 2 : 5;
        this._otherCars.push(new Car(x, -carHeight));

        // Setup player car
        this.player.moveRelative(0, 0);

        addOnKeyDownListener('ArrowLeft', this.playerMoveLeft);
        addOnKeyDownListener('ArrowRight', this.playerMoveRight);

        this.state = 'started';
    };

    update = () => {
        if (this.state === 'started' && isKeyDown()) {
            this.state = 'running';
            this.lastFrame = performance.now();
        }

        if (this.state === 'running') {
            if (this._explosion) {
                if (this._explosion.AnimationState === 'finished') {
                    this.stop();
                } else {
                    this._explosion.update();
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

            const now = performance.now();
            const delta = now - this.lastFrame;
            const shouldUpdateTime = 200 - actualSpeed * 1;

            if (delta > shouldUpdateTime) {
                const stepsFloat = delta / shouldUpdateTime;
                const steps = Math.floor(stepsFloat);

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
                            this._explosion = new Explosion(car.x, car.y - 1);
                        } else if (car.y == playerCarY + 1) {
                            this._score.update(score => score + 100 + actualSpeed);

                            if (this._speed < maxSpeed) {
                                this._speed++;
                            }
                        }
                    }
                }

                // Generate new car if last car's Y is at least 5 blocks away from the top
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (this._otherCars.at(-1)!.y >= 5) {
                    const x = Math.random() > 0.5 ? 2 : 5;
                    this._otherCars.push(new Car(x, -carHeight));
                }

                this.lastFrame = now;
            }
        }
    };

    stop = () => {
        this.state = 'stopped';

        this._player = undefined;
        this._walls.length = 0;
        this._otherCars.length = 0;
        this._explosion = undefined;

        removeOnKeyDownListener('ArrowLeft', this.playerMoveLeft);
        removeOnKeyDownListener('ArrowRight', this.playerMoveRight);
    };

    playerMoveLeft = () => {
        if (this._explosion) return;

        const x = -3;

        if (this.player.x + x == 2) {
            this.player.moveRelative(x, 0);
        }

        // Checks collision with other cars
        this._otherCars.forEach((car) => {
            if (car.isCollidingBox(this.player)) {
                this._explosion = new Explosion(car.x, car.y - 1);
            }
        });
    };

    playerMoveRight = () => {
        if (this._explosion) return;

        const x = 3;

        if (this.player.x + x == 5) {
            this.player.moveRelative(x, 0);
        }

        // Checks collision with other cars
        this._otherCars.forEach((car) => {
            if (car.isCollidingBox(this.player)) {
                this._explosion = new Explosion(car.x, car.y - 1);
            }
        });
    };
}

export default CarRacingBrain;
