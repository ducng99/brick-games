import { writable } from 'svelte/store';

class CBlock {
    on = writable(false);

    toggle(state: boolean) {
        this.on.update(() => state);
    }
}

export default CBlock;
