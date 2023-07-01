import { writable } from 'svelte/store';
import type CBlock from '../components/CBlock';
import type Renderer from '../libs/Renderer.svelte';

export const width = writable(4);
export const height = writable(4);

export const bricks = writable<CBlock[][]>([]);

export const RendererMiniInstance = writable<null | Renderer>(null);
