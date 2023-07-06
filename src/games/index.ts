import { get, writable } from 'svelte/store';
import { addOnKeyDownListener, removeOnKeyDownListener } from '../libs/KeyboardHandler';
import GamesList, { CurrentGameId } from './GamesList';
import Brain from './libs/Brain';
import type AnimatedFrames from './libs/AnimatedFrames';
import { charToLetter } from './libs/special-animations/spinning-letters';
import { width } from '../stores/RendererStore';

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
        this._letterAnimation?.update();
        this._gameAnimation?.update();
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
        this._currentGameIndex.update(index => (index - 1) % this._gamesArray.length);
    };

    selectNextGame = () => {
        this._currentGameIndex.update(index => (index + 1) % this._gamesArray.length);
    };

    loadLetterAnimation = (index: number) => {
        charToLetter(String.fromCharCode(97 + index)).then(Letter => {
            if (Letter) {
                const x = Math.floor(get(width) / 2 - 3);
                this._letterAnimation = new Letter(x, 0);
            }
        }).catch(() => {
            console.error('Failed loading letter animation');
        });
    };

    loadGameAnimation = (index: number) => {
        GamesList[this._gamesArray[index]].animation().then((Animation) => {
            this._gameAnimation = new Animation();
        }).catch(() => {
            console.error('Failed loading game animation');
        });
    };
}

export default GameMenu;
