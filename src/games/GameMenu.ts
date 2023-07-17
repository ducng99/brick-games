import { writable, type Unsubscriber } from 'svelte/store';
import { addOnKeyDownListener, removeOnKeyDownListener } from '../libs/KeyboardHandler';
import GamesList, { CurrentGameId, CurrentGameVariant } from './GamesList';
import Brain from './libs/Brain';
import type AnimatedFrames from './libs/AnimatedFrames';
import { charToLetter } from './libs/special-animations/spinning-letters';
import { rendererHeight, rendererWidth } from '../stores/RendererStore';
import { type Callable } from '../libs/utils';
import { type CancelablePromise, cancelablePromise, CanceledPromiseError } from '../libs/utils/CancelablePromise';
import type Entity from './libs/Entity';
import { numberToEntity } from './libs/common-entities/numbers';

/**
 * Used to detect which game is currently selected in the menu.
 * NOT the current game that is running.
 */
export const menuCurrentGameIdStore = writable('');
let menuCurrentGameId = '';
menuCurrentGameIdStore.subscribe((value) => {
    menuCurrentGameId = value;
});

const menuCurrentGameIndexStore = writable(0);
let menuCurrentGameIndex = 0;
menuCurrentGameIndexStore.subscribe((value) => {
    menuCurrentGameIndex = value;
});

export const menuCurrentGameVariantStore = writable(0);
let menuCurrentGameVariant = 0;
menuCurrentGameVariantStore.subscribe((value) => {
    menuCurrentGameVariant = value;
});

class GameMenu extends Brain {
    private readonly _gamesArray: string[] = Object.keys(GamesList);
    private _letterAnimation?: AnimatedFrames;
    private _letterAnimationPromise?: CancelablePromise<Callable<AnimatedFrames, [x: number, y: number]> | undefined>;
    private _gameAnimation?: AnimatedFrames;
    private _gameAnimationPromise?: CancelablePromise<Callable<AnimatedFrames, [x: number, y: number]>>;
    private _gameVariantNumber?: Entity;
    private _gameVariantNumberPromise?: CancelablePromise<Callable<Entity, [x: number, y: number]> | undefined>;
    private readonly _unsubscribers: Unsubscriber[] = [];

    setRendererWidthHeight(): [number, number] {
        return [10, 20];
    }

    start() {
        addOnKeyDownListener('ArrowLeft', this.selectPreviousGame);
        addOnKeyDownListener('ArrowRight', this.selectNextGame);
        addOnKeyDownListener('ArrowUp', this.selectPreviousGameVariant);
        addOnKeyDownListener('ArrowDown', this.selectNextGameVariant);
        addOnKeyDownListener('Space', this.loadGame);

        // On game change
        this._unsubscribers.push(menuCurrentGameIndexStore.subscribe((index) => {
            menuCurrentGameIdStore.set(this._gamesArray[index]);
            menuCurrentGameVariantStore.set(0);

            this.loadLetterAnimation(index);
            this.loadGameAnimation(index, 0);
            this.loadGameVariantNumber(0);
        }));

        // On variant change
        this._unsubscribers.push(menuCurrentGameVariantStore.subscribe((variant) => {
            this.loadGameAnimation(menuCurrentGameIndex, variant);
            this.loadGameVariantNumber(variant);
        }));

        return super.start();
    }

    update = (timestamp: DOMHighResTimeStamp) => {
        if (this._letterAnimation?.AnimationState !== 'finished') {
            this._letterAnimation?.update(timestamp);
        }

        if (this._gameAnimation?.AnimationState !== 'finished') {
            this._gameAnimation?.update(timestamp);
        }
    };

    stop() {
        this._letterAnimationPromise?.cancel();
        this._letterAnimation = undefined;
        this._gameAnimationPromise?.cancel();
        this._gameAnimation = undefined;
        this._gameVariantNumberPromise?.cancel();
        this._gameVariantNumber = undefined;

        removeOnKeyDownListener('ArrowLeft', this.selectPreviousGame);
        removeOnKeyDownListener('ArrowRight', this.selectNextGame);
        removeOnKeyDownListener('ArrowUp', this.selectPreviousGameVariant);
        removeOnKeyDownListener('ArrowDown', this.selectNextGameVariant);
        removeOnKeyDownListener('Space', this.loadGame);

        this._unsubscribers.forEach(unsubscribe => { unsubscribe(); });

        return super.stop();
    }

    loadGame = () => {
        CurrentGameId.set(menuCurrentGameId);
        CurrentGameVariant.set(menuCurrentGameVariant);
    };

    selectPreviousGame = () => {
        menuCurrentGameIndexStore.update(index => (((index - 1) % this._gamesArray.length) + this._gamesArray.length) % this._gamesArray.length);
    };

    selectNextGame = () => {
        menuCurrentGameIndexStore.update(index => (index + 1) % this._gamesArray.length);
    };

    selectPreviousGameVariant = () => {
        const variants = GamesList[menuCurrentGameId].length;
        menuCurrentGameVariantStore.update(variant => (((variant - 1) % variants) + variants) % variants);
    };

    selectNextGameVariant = () => {
        const variants = GamesList[menuCurrentGameId].length;
        menuCurrentGameVariantStore.update(variant => (variant + 1) % variants);
    };

    loadLetterAnimation = (index: number) => {
        this._letterAnimation?.stop();

        this._letterAnimationPromise = cancelablePromise(charToLetter(String.fromCharCode(97 + index)));
        this._letterAnimationPromise.promise.then(Letter => {
            if (Letter) {
                const x = Math.floor(rendererWidth * 0.5 - 3);
                this._letterAnimation = new Letter(x, 0);
            }
        }).catch((ex) => {
            if (!(ex instanceof CanceledPromiseError)) {
                console.error('Failed loading letter animation');
                console.error(ex);
            }
        });
    };

    loadGameAnimation = (index: number, variant: number) => {
        this._gameAnimation?.stop();

        this._gameAnimationPromise = cancelablePromise(GamesList[this._gamesArray[index]][variant].animation());
        this._gameAnimationPromise.promise.then((Animation) => {
            this._gameAnimation = new Animation(0, 6);
        }).catch((ex) => {
            if (!(ex instanceof CanceledPromiseError)) {
                console.error('Failed loading game animation');
                console.error(ex);
            }
        });
    };

    loadGameVariantNumber = (index: number) => {
        this._gameVariantNumber?.clear();

        this._gameVariantNumberPromise = cancelablePromise(numberToEntity(index + 1));
        this._gameVariantNumberPromise.promise.then((NumberEntity) => {
            if (NumberEntity) {
                this._gameVariantNumber = new NumberEntity(0, rendererHeight - 5);
            }
        }).catch((ex) => {
            if (!(ex instanceof CanceledPromiseError)) {
                console.error('Failed loading game variant number');
                console.error(ex);
            }
        });
    };
}

export default GameMenu;
