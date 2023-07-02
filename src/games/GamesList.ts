import { writable } from 'svelte/store';

interface GameInfo {
    name: string;
    loader: () => Promise<any>;
}

export const CurrentGameId = writable('');

/**
 * Games metadata.
 * Each key is the game id.
 */
const GamesList: Record<string, GameInfo> = {
    'car-racing': {
        name: 'Car Racing',
        loader: () => import('./car-racing')
    }
};

export default GamesList;
