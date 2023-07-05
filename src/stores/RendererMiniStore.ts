import { writable } from 'svelte/store';
import type Renderer from '../libs/Renderer.svelte';

export const width = writable(4);
export const height = writable(4);

export const RendererMiniInstance = writable<Renderer | undefined>(undefined);
