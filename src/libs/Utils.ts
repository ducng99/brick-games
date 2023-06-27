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
 * @param char Char to pad with
 * @returns Padded string
 */
export function pad(num: number | string, size: number, char: string = '0'): string {
    let s = num.toString();
    while (s.length < size) s = char + s;
    return s;
}
