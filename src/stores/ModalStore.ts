import { writable, type Writable } from 'svelte/store';
import type Modal from '../components/Modals.svelte';

export const ModalsInstanceStore: Writable<Modal | undefined> = writable(undefined);
export let ModalsInstance: Modal | undefined;
ModalsInstanceStore.subscribe((value) => (ModalsInstance = value));
