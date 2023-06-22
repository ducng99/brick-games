import { writable } from "svelte/store";

export class CBlock {
    on = writable(false);
    
    toggle(state: boolean) {
        this.on.update(() => state);
    }
}