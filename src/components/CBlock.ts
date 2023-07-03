import { writable } from 'svelte/store';

class CBlock {
    private readonly on = writable(false);

    toggle(state: boolean) {
        this.on.set(state);
    }
}

export default CBlock;
