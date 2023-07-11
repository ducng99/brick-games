import Entity from '../libs/Entity';
import Paddle from './Paddle';

type BallDirection = 'up-left' | 'up-right' | 'up-straight' | 'down-left' | 'down-right' | 'down-straight';

class Ball extends Entity {
    direction: BallDirection = 'up-left';

    constructor(x: number, y: number) {
        super(x, y, [[0, 0]], [0, 0, 1, 1]);
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
            if (this.direction === 'up-left' || this.direction === 'down-left') {
                return super.isCollidingBox(entity, offsetX, offsetY) || super.isCollidingBox(entity, offsetX + 1, offsetY);
            } else if (this.direction === 'up-right' || this.direction === 'down-right') {
                return super.isCollidingBox(entity, offsetX, offsetY) || super.isCollidingBox(entity, offsetX - 1, offsetY);
            }
        }

        return super.isCollidingBox(entity, offsetX, offsetY);
    }
}

export default Ball;
