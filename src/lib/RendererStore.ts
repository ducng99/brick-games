import { writable } from "svelte/store";
import type { CBlock } from "../components/Block";

export const width = writable(10);
export const height = writable(20);

export const bricks = writable<CBlock[][]>([]);