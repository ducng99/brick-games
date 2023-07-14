import { writable } from 'svelte/store';
import { uuidv4 } from '../libs/utils';

class CBlock {
    private readonly _id = uuidv4();
    private readonly _on = writable(false);

    get id() {
        return this._id;
    }

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
