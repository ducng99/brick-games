import { writable } from 'svelte/store';
import { addOnKeyDownListener, removeOnKeyDownListener } from '../libs/KeyboardHandler';
import GamesList, { CurrentGameId } from './GamesList';
import Brain from './libs/Brain';

export const MenuCurrentSelectGameId = writable('');

class GameMenu extends Brain {
    private _currentGameIndex = 0;
    private readonly _gamesArray: string[] = Object.keys(GamesList);

    start = () => {
        addOnKeyDownListener('ArrowLeft', this.selectPreviousGame);
        addOnKeyDownListener('ArrowRight', this.selectNextGame);
        addOnKeyDownListener('Space', this.loadGame);

        MenuCurrentSelectGameId.set(this._gamesArray[this._currentGameIndex]);
    };

    update = () => {

    };

    stop = () => {
        removeOnKeyDownListener('ArrowLeft', this.selectPreviousGame);
        removeOnKeyDownListener('ArrowRight', this.selectNextGame);
        removeOnKeyDownListener('Space', this.loadGame);
    };

    loadGame = () => {
        CurrentGameId.set(this._gamesArray[this._currentGameIndex]);
    };

    selectPreviousGame = () => {
        this._currentGameIndex = (this._currentGameIndex - 1) % this._gamesArray.length;
        MenuCurrentSelectGameId.set(this._gamesArray[this._currentGameIndex]);
    };

    selectNextGame = () => {
        this._currentGameIndex = (this._currentGameIndex + 1) % this._gamesArray.length;
        MenuCurrentSelectGameId.set(this._gamesArray[this._currentGameIndex]);
    };
}

export default GameMenu;
