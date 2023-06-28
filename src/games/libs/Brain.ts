import { writable, type Writable } from 'svelte/store';

interface Brain {
    /**
     * (Optional) Update the brain logic each frame.
     */
    update?: () => void;

    /**
     * (Optional) Stop the brain.
     * This function mainly used to clear all entities and event listeners.
     */
    stop?: () => void;
}

type BrainState = 'created' | 'started' | 'running' | 'stopped';

/**
 * A generic brain class that is used for any game logic.
 */
abstract class Brain {
    state: BrainState = 'created';
    protected lastFrame: number = 0;
    protected _score: Writable<number> = writable(0);

    get score(): Writable<number> {
        return this._score;
    }

    /**
     * Initialize the brain.
     */
    abstract start: () => void;
}

export default Brain;
