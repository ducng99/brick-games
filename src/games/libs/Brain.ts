interface Brain {
    /**
     * (Optional) Update the brain logic each frame.
     */
    update?: () => void;

    /**
     * (Optional) Stop the brain.
     * This function mainly used to clear all objects and listeners.
     */
    stop?: () => void;
}

type BrainState = 'created' | 'started' | 'running' | 'stopped';

/**
 * A generic brain class that is used for any game logic.
 */
abstract class Brain {
    state: BrainState = 'created';
    protected lastFrame: number = performance.now();
    protected _score: number = 0;

    get score(): number {
        return this._score;
    }

    /**
     * Initialize the brain.
     */
    abstract start: () => void;
}

export default Brain;
