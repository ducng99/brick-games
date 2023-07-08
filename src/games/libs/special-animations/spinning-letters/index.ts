import type AnimatedFrames from '../../AnimatedFrames';

export async function charToLetter(char: string): Promise<(new (x: number, y: number) => AnimatedFrames) | undefined> {
    switch (char.toLowerCase()) {
        case 'a':
            return (await import('./LetterA')).default;
        default:
            break;
    }
}
