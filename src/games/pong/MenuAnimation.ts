import { rendererWidth, rendererHeight } from '../../stores/RendererStore';
import AnimatedFrames from '../libs/AnimatedFrames';

class MenuAnimation extends AnimatedFrames {
    constructor() {
        super(0, 6, 720, [], [0, 6, rendererWidth, rendererHeight], true);
    }
}

export default MenuAnimation;
