import { writable } from 'svelte/store';

class CBlock {
    private readonly _on = writable(false);

    get on() {
        return this._on;
    }

    toggle(state?: boolean) {
        if (typeof state === 'boolean') {
            this._on.set(state);
        } else {
            this._on.update((value) => !value);
        }
    }
}

export default CBlock;
