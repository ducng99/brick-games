import { writable } from "svelte/store";
import type { CBlock } from "../components/Block";
import type Renderer from "../lib/Renderer.svelte";

export const width = writable(10);
export const height = writable(20);

export const bricks = writable<CBlock[][]>([]);

export const RendererInstance = writable<null | Renderer>(null);