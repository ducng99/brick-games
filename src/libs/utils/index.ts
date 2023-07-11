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
