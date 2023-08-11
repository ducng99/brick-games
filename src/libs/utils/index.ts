/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param min
 * @param max
 * @returns
 */
export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * UUIDv4 generator
 */
export function uuidv4(): string {
    if (window.isSecureContext && 'randomUUID' in window.crypto) {
        return window.crypto.randomUUID();
    } else {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

/**
 * Paddding a number with specified char
 * @param num Number to pad
 * @param size Size of the padded string
 * @param char Char to pad with. Default is '0'
 * @returns Padded string
 */
export function pad(num: number | string, size: number, char: string = '0'): string {
    let s = num.toString();
    while (s.length < size) s = char + s;
    return s;
}

/**
 * Clamps a number between min and max
 * @param num Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped number
 */
export function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}

export type Callable<T, A extends any[] = []> = new (...args: A) => T;

/**
 * Returns a new object without the specified key
 * @param obj Object to remove key from
 * @param key Key to remove
 * @returns A new object without the specified key
 */
export function removeKeyFromObject<K extends string | number | symbol, V>(obj: Record<K, V>, key: K): Omit<Record<K, V>, K> {
    const { [key]: _, ...rest } = obj;
    return rest;
}

/**
 * Returns a new object with entries that satisfy the predicate function
 * @param obj Object to filter
 * @param predicate Predicate function
 * @returns A new object
 */
export function filterObject<K extends string | number | symbol, V>(obj: Record<K, V>, predicate: (key: K, value: V) => boolean): Omit<Record<K, V>, K> {
    return Object.keys(obj).reduce<Record<K, V>>((r, e) => {
        if (predicate(e as K, obj[e])) r[e] = obj[e];
        return r;
    // @ts-expect-error it's an empty object bruh
    }, {}) as Omit<Record<K, V>, K>;
}
