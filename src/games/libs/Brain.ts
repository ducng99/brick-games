import { writable } from 'svelte/store';
import type Renderer from '../../libs/Renderer.svelte';
import { RendererInstance } from '../../stores/RendererStore';

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
    protected lastFrame = 0;
    protected _score = writable(0);
    protected renderer: Renderer | null = null;

    constructor() {
        RendererInstance.subscribe(instance => {
            this.renderer = instance;
        });
    }

    get score() {
        return this._score;
    }

    /**
     * Initialize the brain.
     */
    abstract start: () => void;
}

export default Brain;
