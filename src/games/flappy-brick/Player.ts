import Entity from '../libs/Entity';

const constantForce = 0.04;

class Player extends Entity {
    public floatY;
    private _velocityY = 0;

    constructor(x: number, y: number) {
        super(x, y, [[0, 0]], [0, 0, 1, 1]);

        this.floatY = y;
    }

    update(steps: number) {
        this.velocityY += constantForce * steps;
        this.floatY += this.velocityY;
        this.move(this.x, Math.floor(this.floatY));
    }

    jump() {
        this.velocityY = -0.6;
    }

    get velocityY(): number {
        return this._velocityY;
    }

    set velocityY(value: number) {
        this._velocityY = Math.min(value, 0.25);
    }
}

export default Player;
