import { get, writable } from 'svelte/store';
import { addOnKeyDownListener, removeOnKeyDownListener } from '../libs/KeyboardHandler';
import GamesList, { CurrentGameId } from './GamesList';
import Brain from './libs/Brain';
import type AnimatedFrames from './libs/AnimatedFrames';
import { charToLetter } from './libs/special-animations/spinning-letters';
import { rendererWidth } from '../stores/RendererStore';
import { type Callable } from '../libs/utils';
import { type CancelablePromise, cancelablePromise, CanceledPromiseError } from '../libs/utils/CancelablePromise';

/**
 * Used to detect which game is currently selected in the menu.
 * NOT the current game that is running.
 */
export const MenuCurrentSelectGameId = writable('');

class GameMenu extends Brain {
    private readonly _currentGameIndex = writable(0);
    private readonly _gamesArray: string[] = Object.keys(GamesList);
    private _letterAnimation?: AnimatedFrames;
    private _letterAnimationPromise?: CancelablePromise<Callable<AnimatedFrames, [x: number, y: number]> | undefined>;
    private _gameAnimation?: AnimatedFrames;
    private _gameAnimationPromise?: CancelablePromise<Callable<AnimatedFrames>>;

    start = () => {
        addOnKeyDownListener('ArrowLeft', this.selectPreviousGame);
        addOnKeyDownListener('ArrowRight', this.selectNextGame);
        addOnKeyDownListener('Space', this.loadGame);

        this._currentGameIndex.subscribe((index) => {
            MenuCurrentSelectGameId.set(this._gamesArray[index]);

            this.loadLetterAnimation(index);
            this.loadGameAnimation(index);
        });

        return super.start();
    };

    update = (timestamp: DOMHighResTimeStamp) => {
        if (this._letterAnimation?.AnimationState !== 'finished') {
            this._letterAnimation?.update(timestamp);
        }

        if (this._gameAnimation?.AnimationState !== 'finished') {
            this._gameAnimation?.update(timestamp);
        }
    };

    stop = () => {
        this._letterAnimationPromise?.cancel();
        this._letterAnimation = undefined;
        this._gameAnimationPromise?.cancel();
        this._gameAnimation = undefined;

        removeOnKeyDownListener('ArrowLeft', this.selectPreviousGame);
        removeOnKeyDownListener('ArrowRight', this.selectNextGame);
        removeOnKeyDownListener('Space', this.loadGame);

        return super.stop();
    };

    loadGame = () => {
        this._letterAnimationPromise?.cancel();
        this._gameAnimationPromise?.cancel();
        CurrentGameId.set(get(MenuCurrentSelectGameId));
    };

    selectPreviousGame = () => {
        this._currentGameIndex.update(index => (((index - 1) % this._gamesArray.length) + this._gamesArray.length) % this._gamesArray.length);
    };

    selectNextGame = () => {
        this._currentGameIndex.update(index => (index + 1) % this._gamesArray.length);
    };

    loadLetterAnimation = (index: number) => {
        this._letterAnimation?.stop();

        this._letterAnimationPromise = cancelablePromise(charToLetter(String.fromCharCode(97 + index)));
        this._letterAnimationPromise.promise.then(Letter => {
            if (Letter) {
                const x = Math.floor(rendererWidth / 2 - 3);
                this._letterAnimation = new Letter(x, 0);
            }
        }).catch((ex) => {
            if (!(ex instanceof CanceledPromiseError)) {
                console.error('Failed loading letter animation');
                console.error(ex);
            }
        });
    };

    loadGameAnimation = (index: number) => {
        this._gameAnimation?.stop();

        this._gameAnimationPromise = cancelablePromise(GamesList[this._gamesArray[index]].animation());
        this._gameAnimationPromise.promise.then((Animation) => {
            this._gameAnimation = new Animation();
        }).catch((ex) => {
            if (!(ex instanceof CanceledPromiseError)) {
                console.error('Failed loading game animation');
                console.error(ex);
            }
        });
    };
}

export default GameMenu;
