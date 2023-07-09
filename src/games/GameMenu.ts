import { get, writable } from 'svelte/store';
import { addOnKeyDownListener, removeOnKeyDownListener } from '../libs/KeyboardHandler';
import GamesList, { CurrentGameId } from './GamesList';
import Brain from './libs/Brain';
import type AnimatedFrames from './libs/AnimatedFrames';
import { charToLetter } from './libs/special-animations/spinning-letters';
import { rendererWidth } from '../stores/RendererStore';

/**
 * Used to detect which game is currently selected in the menu.
 * NOT the current game that is running.
 */
export const MenuCurrentSelectGameId = writable('');

class GameMenu extends Brain {
    private readonly _currentGameIndex = writable(0);
    private readonly _gamesArray: string[] = Object.keys(GamesList);
    private _letterAnimation?: AnimatedFrames;
    private _gameAnimation?: AnimatedFrames;

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

    update = () => {
        if (this._letterAnimation?.AnimationState !== 'finished') {
            this._letterAnimation?.update();
        }

        if (this._gameAnimation?.AnimationState !== 'finished') {
            this._gameAnimation?.update();
        }
    };

    stop = () => {
        removeOnKeyDownListener('ArrowLeft', this.selectPreviousGame);
        removeOnKeyDownListener('ArrowRight', this.selectNextGame);
        removeOnKeyDownListener('Space', this.loadGame);

        return super.stop();
    };

    loadGame = () => {
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

        charToLetter(String.fromCharCode(97 + index)).then(Letter => {
            if (Letter) {
                const x = Math.floor(rendererWidth / 2 - 3);
                this._letterAnimation = new Letter(x, 0);
            }
        }).catch((ex) => {
            console.error('Failed loading letter animation');
            console.error(ex);
        });
    };

    loadGameAnimation = (index: number) => {
        this._gameAnimation?.stop();

        GamesList[this._gamesArray[index]].animation().then((Animation) => {
            this._gameAnimation = new Animation();
        }).catch((ex) => {
            console.error('Failed loading game animation');
            console.error(ex);
        });
    };
}

export default GameMenu;
