import { randomInt } from '../../libs/utils';
import Entity from '../libs/Entity';
import Paddle from './Paddle';

type BallDirection = 'up-left' | 'up-right' | 'up-straight' | 'down-left' | 'down-right' | 'down-straight';

class Ball extends Entity {
    direction: BallDirection;

    constructor(x: number, y: number) {
        super(x, y, [[0, 0]], [0, 0, 1, 1]);

        const rand = randomInt(0, 5);
        switch (rand) {
            case 0:
                this.direction = 'up-left';
                break;
            case 1:
                this.direction = 'up-right';
                break;
            case 2:
                this.direction = 'up-straight';
                break;
            case 3:
                this.direction = 'down-left';
                break;
            case 4:
                this.direction = 'down-right';
                break;
            case 5:
                this.direction = 'down-straight';
                break;
        }
    }

    update() {
        const [x, y] = this.getFuturePosition();
        this.moveRelative(x, y);
    }

    /**
     * Get future relative position of the ball after update()
     */
    getFuturePosition(): [number, number] {
        switch (this.direction) {
            case 'up-left':
                return [-1, -1];
            case 'up-right':
                return [1, -1];
            case 'up-straight':
                return [0, -1];
            case 'down-left':
                return [-1, 1];
            case 'down-right':
                return [1, 1];
            case 'down-straight':
                return [0, 1];
        }
    }

    /**
     * A special collision detection for ball and paddle based on ball's direction
     */
    isCollidingBox(entity: Entity, offsetX = 0, offsetY = 0): boolean {
        if (entity instanceof Paddle) {
            switch (this.direction) {
                case 'up-left':
                case 'down-left':
                    return super.isCollidingBox(entity, offsetX, offsetY) || super.isCollidingBox(entity, offsetX + 1, offsetY);
                case 'up-right':
                case 'down-right':
                    return super.isCollidingBox(entity, offsetX, offsetY) || super.isCollidingBox(entity, offsetX - 1, offsetY);
            }
        }

        return super.isCollidingBox(entity, offsetX, offsetY);
    }
}

export default Ball;
