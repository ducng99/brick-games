import { writable } from 'svelte/store';
import type Renderer from '../libs/Renderer.svelte';

export const rendererWidthStore = writable(10);
export let rendererWidth = 0;
rendererWidthStore.subscribe((value) => (rendererWidth = value));

export const rendererHeightStore = writable(20);
export let rendererHeight = 0;
rendererHeightStore.subscribe((value) => (rendererHeight = value));

export const RendererInstanceStore = writable<Renderer | undefined>(undefined);
export let RendererInstance: Renderer | undefined;
RendererInstanceStore.subscribe((value) => (RendererInstance = value));
