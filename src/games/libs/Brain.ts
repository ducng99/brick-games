interface Brain {
    /**
     * (Optional) Update the brain.
     */
    update?: () => void;
    /**
     * (Optional) Stop the brain.
     */
    stop?: () => void;
}

/**
 * A generic brain class that is used for any game logic.
 */
abstract class Brain {
    state: 'created' | 'started' | 'running' | 'stopped' = 'created';

    /**
     * Initialize the brain.
     */
    abstract start: () => void;
}

export default Brain;
