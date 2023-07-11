import { writable } from 'svelte/store';

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
    state: BrainState = 'created';
    protected lastFrame = 0;
    protected _score = writable('000');

    get score() {
        return this._score;
    }

    /**
     * Initialize the brain.
     */
    start() {
        this.state = 'started';

        return callStart;
    }

    /**
     * (Optional) Stop the brain.
     * This function mainly used to clear all entities and event listeners.
     */
    stop() {
        this.state = 'stopped';

        return callStop;
    }
}

export default Brain;
