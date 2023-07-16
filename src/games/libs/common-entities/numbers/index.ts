import type { Callable } from '../../../../libs/utils';
import type Entity from '../../Entity';

export async function numberToEntity(num: number): Promise<Callable<Entity, [ x: number, y: number ]> | undefined> {
    switch (num) {
        case 1:
            return (await import('./Number01')).default;
        case 2:
            return (await import('./Number02')).default;
        default:
            break;
    }
}
