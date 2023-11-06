import { rendererHeight } from '../../stores/RendererStore';
import Entity, { type Sprite } from '../libs/Entity';
import { floorHeight } from './Floor';

export const pipeWidth = 2;
export const pipeVerticalGap = 5;

class Pipe extends Entity {
    constructor(x: number, y: number, gapStartY: number) {
        const sprite: Sprite = Array.from({ length: gapStartY }, (_, row) => {
            const ret: Sprite = [];

            for (let i = 0; i < pipeWidth; i++) {
                ret.push([i, row]);
            }

            return ret;
        }).concat(Array.from({ length: rendererHeight - floorHeight - gapStartY - pipeVerticalGap }, (_, row) => {
            const ret: Sprite = [];

            for (let i = 0; i < pipeWidth; i++) {
                ret.push([i, row + gapStartY + pipeVerticalGap]);
            }

            return ret;
        })).flat();

        super(x, y, sprite);
    }
}

export default Pipe;
