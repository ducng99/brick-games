import { writable } from 'svelte/store';
import type Renderer from '../libs/Renderer.svelte';

export const rendererMiniWidth = 4;
export const rendererMiniHeight = 4;

export const RendererMiniInstanceStore = writable<Renderer | undefined>(undefined);
export let RendererMiniInstance: Renderer | undefined;
RendererMiniInstanceStore.subscribe((value) => (RendererMiniInstance = value));
