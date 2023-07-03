import { writable } from 'svelte/store';
import type Renderer from '../libs/Renderer.svelte';

export const width = writable(10);
export const height = writable(20);

export const RendererInstance = writable<null | Renderer>(null);
