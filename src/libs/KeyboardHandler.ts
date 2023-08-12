const keysDown = new Set<string>();

const keyDownCallbacks: Record<string, Set<() => void>> = {};
const keyUpCallbacks: Record<string, Set<() => void>> = {};

addEventListener('keydown', (event) => {
    if (!isKeyDown(event.code)) {
        if (event.code in keyDownCallbacks) {
            keyDownCallbacks[event.code].forEach((callback) => { callback(); });
        }

        keysDown.add(event.code);
    }
});

addEventListener('keyup', (event) => {
    if (event.code in keyUpCallbacks) {
        keyUpCallbacks[event.code].forEach((callback) => { callback(); });
    }

    keysDown.delete(event.code);
});

/**
 * Check if a key is down or if any key is down.
 * @param key Key to check if is down. If not provided, checks if any key is down.
 */
export function isKeyDown(key?: string): boolean {
    if (key) {
        return keysDown.has(key);
    }

    return keysDown.size > 0;
}

/**
 * Add a callback to be called when a key is pressed.
 * @param key
 * @param callback
 * @see {@link removeOnKeyDownListener}
 * @returns `callback` function reference.
 */
export function addOnKeyDownListener(key: string, callback: () => void) {
    if (!(key in keyDownCallbacks)) {
        keyDownCallbacks[key] = new Set();
    }

    keyDownCallbacks[key].add(callback);

    return callback;
}

/**
 * Add a callback to be called when a key is released.
 * @param key
 * @param callback
 * @returns `callback` function reference.
 * @see {@link removeOnKeyUpListener}
 */
export function addOnKeyUpListener(key: string, callback: () => void) {
    if (!(key in keyUpCallbacks)) {
        keyUpCallbacks[key] = new Set();
    }

    keyUpCallbacks[key].add(callback);

    return callback;
}

/**
 * Remove a callback from being called when a key is pressed.
 * @param key
 * @param callback
 */
export function removeOnKeyDownListener(key: string, callback: () => void) {
    if (key in keyDownCallbacks) {
        keyDownCallbacks[key].delete(callback);
    }
}

/**
 * Remove a callback from being called when a key is released.
 * @param key
 * @param callback
 */
export function removeOnKeyUpListener(key: string, callback: () => void) {
    if (key in keyUpCallbacks) {
        keyUpCallbacks[key].delete(callback);
    }
}
