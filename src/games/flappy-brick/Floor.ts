import { rendererWidth } from '../../stores/RendererStore';
import Entity, { type Sprite } from '../libs/Entity';

export const floorHeight = 2;

const sprite: Sprite = Array.from({ length: rendererWidth }, (_, row) => {
    const ret: Sprite = [];

    for (let i = 0; i < floorHeight; i++) {
        ret.push([row, i]);
    }

    return ret;
}).flat();

class Floor extends Entity {
    constructor(x: number, y: number) {
        super(x, y, sprite, [0, 0, rendererWidth, floorHeight]);
    }
}

export default Floor;
