import { randomInt } from '../../../libs/utils';
import Entity from '../../libs/Entity';
import Paddle from './Paddle';

type BallDirection = 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'left-straight' | 'right-straight';

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
                this.direction = 'down-left';
                break;
            case 3:
                this.direction = 'down-right';
                break;
            case 4:
                this.direction = 'left-straight';
                break;
            case 5:
                this.direction = 'right-straight';
                break;
            default:
                this.direction = 'up-right';
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
            case 'down-left':
                return [-1, 1];
            case 'down-right':
                return [1, 1];
            case 'left-straight':
                return [-1, 0];
            case 'right-straight':
                return [1, 0];
            default:
                return [0, 0];
        }
    }

    /**
     * A special collision detection for ball and paddle based on ball's direction
     */
    isCollidingBox(entity: Entity, offsetX = 0, offsetY = 0): boolean {
        if (entity instanceof Paddle) {
            switch (this.direction) {
                case 'up-left':
                case 'up-right':
                    return super.isCollidingBox(entity, offsetX, offsetY) || super.isCollidingBox(entity, offsetX, offsetY + 1);
                case 'down-left':
                case 'down-right':
                    return super.isCollidingBox(entity, offsetX, offsetY) || super.isCollidingBox(entity, offsetX, offsetY - 1);
            }
        }

        return super.isCollidingBox(entity, offsetX, offsetY);
    }
}

export default Ball;
