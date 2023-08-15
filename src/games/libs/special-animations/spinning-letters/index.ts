import type { Callable } from '../../../../libs/utils';
import type AnimatedFrames from '../../AnimatedFrames';

export async function charToLetter(char: string): Promise<Callable<AnimatedFrames, [ x: number, y: number ]> | undefined> {
    switch (char.toLowerCase()) {
        case 'a':
            return (await import('./LetterA')).default;
        case 'b':
            return (await import('./LetterB')).default;
        case 'c':
            return (await import('./LetterC')).default;
        default:
            break;
    }
}
