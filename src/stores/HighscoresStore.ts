import { PersistentStore } from './PersistentStore';

const cacheStores: Record<string, PersistentStore<number>> = {};

export function getHiScoreStore(gameID: string) {
    if (!cacheStores[gameID]) {
        cacheStores[gameID] = new PersistentStore(gameID + '_hiscore', 0);
    }

    return cacheStores[gameID];
}
