import { writable } from "svelte/store";

export class CBlock {
    on = writable(false);
}