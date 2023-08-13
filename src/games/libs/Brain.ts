import { writable } from 'svelte/store';
import { rendererHeightStore, rendererWidthStore } from '../../stores/RendererStore';
import { getHiScoreStore } from '../../stores/HighscoresStore';
import { type PersistentStore } from '../../stores/PersistentStore';
import { GamepadSettingsHelper, type GamepadSettingsType } from './GamepadSettingsHelper';

type BrainState = 'created' | 'started' | 'running' | 'stopped';

/**
 * Workaround forcing child class to call parent function
 * @see https://stackoverflow.com/a/69463764
 */
const callStart = Symbol('Brain.start must be called in child class');
const callStop = Symbol('Brain.stop must be called in child class');

interface Brain {
    /**
     * (Optional) Update the brain logic each frame.
     */
    update?: (timestamp: DOMHighResTimeStamp) => void;
}

/**
 * A generic brain class that is used for any game logic.
 */
abstract class Brain {
    private readonly id: string;
    private _state: BrainState = 'created';
    protected lastFrame = 0;
    private readonly _score = writable('000');
    private readonly _hiScoreStore: PersistentStore<number>;
    private _gamepadHelper?: GamepadSettingsHelper<any>;

    /** A universal list of unsubscribe functions. These are called on {@link Brain.stop} */
    private readonly _unsubscribers: Array<() => void> = [];

    // Width and height the brains wants to set the renderer to
    private readonly _width: number;
    private readonly _height: number;

    constructor(gameID: string) {
        this.id = gameID;
        this._hiScoreStore = getHiScoreStore(gameID);

        const [width, height] = this.setRendererWidthHeight();
        this._width = width;
        this._height = height;

        rendererWidthStore.set(width);
        rendererHeightStore.set(height);
    }

    get state() {
        return this._state;
    }

    protected set state(value: BrainState) {
        this._state = value;
    }

    get score() {
        return this._score;
    }

    get hiScoreStore() {
        return this._hiScoreStore;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    protected get unsubscribers() {
        return this._unsubscribers;
    }

    /**
     * Get storage containing gamepads settings
     * @param defaultValue Default gamepads settings
     * @returns PersistentStore of gamepads settings
     */
    gamepadHelper<T>(defaultValue: GamepadSettingsType<T> = {}): GamepadSettingsHelper<T> {
        if (!this._gamepadHelper) {
            this._gamepadHelper = new GamepadSettingsHelper(this.id, defaultValue);
        }

        return this._gamepadHelper as GamepadSettingsHelper<T>;
    }

    /**
     * Initialize the brain.
     */
    start() {
        this.state = 'started';

        return callStart;
    }

    /**
     * This function is called instead of `update()` when the modal is open. Avoids processing main logic.
     * Mainly used to update `lastFrame`.
     * @param timestamp
     */
    updateWhenModalOpen(timestamp: DOMHighResTimeStamp) {
        this.lastFrame = timestamp;
    }

    /**
     * (Optional) Stop the brain.
     * This function mainly used to clear all entities and event listeners.
     */
    stop() {
        this._unsubscribers.forEach(unsubscribe => { unsubscribe(); });
        this._unsubscribers.length = 0;

        this.state = 'stopped';

        return callStop;
    }

    /**
     * Sets the width and height of the renderer.
     * This function must return an array of [width, height] as number of blocks
     */
    abstract setRendererWidthHeight(): [width: number, height: number];
}

export default Brain;
