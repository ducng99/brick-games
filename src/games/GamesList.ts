import { writable } from 'svelte/store';
import type AnimatedFrames from './libs/AnimatedFrames';
import type Brain from './libs/Brain';
import type { Callable } from '../libs/utils';

interface GameInfo {
    name: string;
    animation: () => Promise<Callable<AnimatedFrames, [x: number, y: number]>>;
    loader: () => Promise<Callable<Brain, [gameID: string]>>;
}

export const CurrentGameId = writable('');
export const CurrentGameVariant = writable(0);

/**
 * Games metadata.
 * Each key is the game id.
 */
const GamesList: Record<string, GameInfo[]> = {
    'car-racing': [{
        name: 'Car Racing',
        animation: async () => (await import('./car-racing/MenuAnimation')).default,
        loader: async () => (await import('./car-racing')).default
    }],
    pong: [
        {
            name: 'Pong',
            animation: async () => (await import('./pong/MenuAnimation')).default,
            loader: async () => (await import('./pong')).default
        },
        {
            name: 'Pong 2',
            animation: async () => (await import('./pong/v2/MenuAnimation')).default,
            loader: async () => (await import('./pong/v2')).default
        },
        {
            name: 'Pong 3',
            animation: async () => (await import('./pong/v3/MenuAnimation')).default,
            loader: async () => (await import('./pong/v3')).default
        }
    ],
    'shoot-bricks': [{
        name: 'Shoot Bricks',
        animation: async () => (await import('./shoot-bricks/MenuAnimation')).default,
        loader: async () => (await import('./shoot-bricks')).default
    }],
    'flappy-brick': [{
        name: 'Flappy Brick',
        animation: async () => (await import('./flappy-brick/MenuAnimation')).default,
        loader: async () => (await import('./flappy-brick')).default
    }]
};

export default GamesList;
