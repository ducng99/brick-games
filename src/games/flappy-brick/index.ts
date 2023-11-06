import Brain from '../libs/Brain';
import Player from '../flappy-brick/Player';
import Pipe, { pipeVerticalGap, pipeWidth } from './Pipe';
import { rendererHeight, rendererWidth } from '../../stores/RendererStore';
import { addOnKeyDownListener, isKeyDown } from '../../libs/KeyboardHandler';
import { GamepadStandardButton, addGamepadButtonDownListener, isGamepadButtonDown, vibrateGamepad, getAllGamepadIndexes } from '../../libs/GamepadHandler';
import Floor, { floorHeight } from './Floor';
import { clamp, padLeft } from '../../libs/utils';
import Explosion from '../libs/common-entities/Explosion';
import WipeBottomToTopTransition from '../libs/common-entities/WipeBottomToTopTransition';
import { AudioTypes, getAudioPlayer } from '../../libs/AudioHandler';

const playerDefaultX = 2;
const playerDefaultY = Math.floor(rendererHeight / 2) - 3;
const frameTime = 16.66666666666667;
const delayPipes = 300;
const pipeHorizontalGap = 7;

class FlappyBrick extends Brain {
    private _player?: Player;
    private readonly _pipes: Pipe[] = [];
    private _floor?: Floor;
    private lastFramePipes = 0;
    private _currentScore = 0;
    private _explosion?: Explosion;
    private _transition?: WipeBottomToTopTransition;

    setRendererWidthHeight(): [width: number, height: number] {
        return [10, 20];
    }

    start() {
        // Setup controls
        addOnKeyDownListener('Space', () => { this.player.jump(); });
        addGamepadButtonDownListener(GamepadStandardButton.A, () => { this.player.jump(); });

        this.restart();
        return super.start();
    }

    update = (timestamp: DOMHighResTimeStamp) => {
        if (this.state === 'started' && (isKeyDown('Space') || isGamepadButtonDown(GamepadStandardButton.A))) {
            this.state = 'running';
            this.lastFrame = timestamp;
            this.lastFramePipes = timestamp;
        }

        if (this.state === 'running') {
            if (this._explosion) {
                if (this._explosion.AnimationState === 'finished') {
                    this._explosion.clear();
                    this._explosion = undefined;
                    this._transition = new WipeBottomToTopTransition();
                } else {
                    this._explosion.update(timestamp);
                }

                return;
            }

            if (this._transition) {
                if (this._transition.AnimationState === 'finished') {
                    this._transition.clear();
                    this.restart();
                } else {
                    this._transition.update(timestamp);
                }

                return;
            }

            const deltaPlayer = timestamp - this.lastFrame;
            let playerCollided = false;

            if (deltaPlayer >= frameTime) {
                const steps = deltaPlayer / frameTime;
                this.player.update(steps);

                if (this.player.isCollidingBox(this.floor)) {
                    playerCollided = true;
                    this.createExplosion(this.player.x, this.player.y);
                }

                for (let i = 0; i < this._pipes.length && !playerCollided; i++) {
                    if (this.player.isColliding(this._pipes[i])) {
                        playerCollided = true;
                        this.createExplosion(this.player.x, this.player.y);
                    }
                }

                this.lastFrame = timestamp;
            }

            const deltaPipes = timestamp - this.lastFramePipes;

            if (!playerCollided && deltaPipes >= delayPipes) {
                const steps = Math.floor(deltaPipes / delayPipes);

                for (let i = 0; i < this._pipes.length && !playerCollided; i++) {
                    this._pipes[i].moveRelative(-steps, 0);

                    if (this._pipes[i].x === this.player.x - 1) {
                        this.currentScore++;
                    } else if (this._pipes[i].isColliding(this.player)) {
                        playerCollided = true;
                        this.createExplosion(this.player.x, this.player.y);
                    }
                }

                // Remove pipes that are out of the screen
                for (let i = this._pipes.length - 1; i >= 0; i--) {
                    if (this._pipes[i].x < -pipeWidth) {
                        this._pipes.splice(i, 1);

                        // Add new pipe after the last pipe in the array
                        const pipeX = this._pipes[this._pipes.length - 1].x + pipeHorizontalGap;
                        const gapStartY = Math.floor(Math.random() * (rendererHeight - floorHeight - pipeVerticalGap - 2 - 1)) + 2;

                        this._pipes.push(new Pipe(pipeX, 0, gapStartY));
                    }
                }

                this.lastFramePipes = timestamp;
            }
        }
    };

    stop() {
        this._player = undefined;
        this._pipes.length = 0;
        this._floor = undefined;
        this._explosion = undefined;
        this._transition = undefined;

        return super.stop();
    }

    restart() {
        this.currentScore = 0;

        this._player = undefined;
        this.player.moveRelative(0, 0);
        this._floor = undefined;
        this.floor.moveRelative(0, 0);

        this._pipes.length = 0;
        this._explosion = undefined;
        this._transition = undefined;

        // Setup pipes
        for (let i = 0; i < 3; i++) {
            const pipeX = rendererWidth + i * pipeHorizontalGap;
            const gapStartY = Math.floor(Math.random() * (rendererHeight - floorHeight - pipeVerticalGap - 2 - 1)) + 2;

            this._pipes.push(new Pipe(pipeX, 0, gapStartY));
        }

        this.state = 'started';
    }

    createExplosion = (x: number, y: number) => {
        x -= 2;
        y -= 2;

        const eX = x + Math.min(0, rendererWidth - (x + 5)) + Math.max(0, -x);
        const eY = y + Math.min(0, rendererHeight - (y + 5)) + Math.max(0, -y);
        this._explosion = new Explosion(eX, eY);

        getAllGamepadIndexes().forEach(index => {
            vibrateGamepad(index, 1.0, 1000).catch(() => {});
        });

        getAudioPlayer(AudioTypes.Explosion)?.play();
    };

    get player(): Player {
        if (!this._player) this._player = new Player(playerDefaultX, playerDefaultY);

        return this._player;
    }

    get floor(): Floor {
        if (!this._floor) this._floor = new Floor(0, rendererHeight - 2);

        return this._floor;
    }

    get currentScore() {
        return this._currentScore;
    }

    set currentScore(score: number) {
        this._currentScore = score;
        this.hiScoreStore.update(hiScore => hiScore > score ? hiScore : score);
        this.score.set(padLeft(clamp(score ?? 0, 0, 999999), 3));
    };
}

export default FlappyBrick;
