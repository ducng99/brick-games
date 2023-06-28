const keysDown = new Set<string>();

const keyDownCallbacks = new Map<string, Set<() => void>>();
const keyUpCallbacks = new Map<string, Set<() => void>>();

window.addEventListener('keydown', (event) => {
    if (!isKeyDown(event.code)) {
        if (keyDownCallbacks.has(event.code)) {
            keyDownCallbacks.get(event.code)?.forEach((callback) => { callback(); });
        }

        keysDown.add(event.code);
    }
});

window.addEventListener('keyup', (event) => {
    if (keyUpCallbacks.has(event.code)) {
        keyUpCallbacks.get(event.code)?.forEach((callback) => { callback(); });
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

export function addOnKeyDownListener(key: string, callback: () => void) {
    if (!keyDownCallbacks.has(key)) {
        keyDownCallbacks.set(key, new Set());
    }

    keyDownCallbacks.get(key)?.add(callback);
}

export function addOnKeyUpListener(key: string, callback: () => void) {
    if (!keyUpCallbacks.has(key)) {
        keyUpCallbacks.set(key, new Set());
    }

    keyUpCallbacks.get(key)?.add(callback);
}

export function removeOnKeyDownListener(key: string, callback: () => void) {
    if (keyDownCallbacks.has(key)) {
        keyDownCallbacks.get(key)?.delete(callback);
    }
}

export function removeOnKeyUpListener(key: string, callback: () => void) {
    if (keyUpCallbacks.has(key)) {
        keyUpCallbacks.get(key)?.delete(callback);
    }
}
