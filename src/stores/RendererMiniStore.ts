import { writable } from 'svelte/store';
import type Renderer from '../libs/Renderer.svelte';

export const rendererMiniWidthStore = writable(4);
export let rendererMiniWidth = 0;
rendererMiniWidthStore.subscribe((value) => (rendererMiniWidth = value));

export const rendererMiniHeightStore = writable(4);
export let rendererMiniHeight = 0;
rendererMiniHeightStore.subscribe((value) => (rendererMiniHeight = value));

export const RendererMiniInstanceStore = writable<Renderer | undefined>(undefined);
export let RendererMiniInstance: Renderer | undefined;
RendererMiniInstanceStore.subscribe((value) => (RendererMiniInstance = value));
