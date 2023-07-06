import { writable } from 'svelte/store';
import type AnimatedFrames from './libs/AnimatedFrames';
import type Brain from './libs/Brain';

type Callable<T, A = unknown> = new (...args: A[]) => T;

interface GameInfo {
    name: string;
    animation: () => Promise<Callable<AnimatedFrames>>;
    loader: () => Promise<Callable<Brain>>;
}

export const CurrentGameId = writable('');

/**
 * Games metadata.
 * Each key is the game id.
 */
const GamesList: Record<string, GameInfo> = {
    'car-racing': {
        name: 'Car Racing',
        animation: async () => (await import('./car-racing/MenuAnimation')).default,
        loader: async () => (await import('./car-racing')).default
    }
};

export default GamesList;
