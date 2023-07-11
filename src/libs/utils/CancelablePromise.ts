export class CanceledPromiseError extends Error {
    constructor() {
        super('Promise canceled');
    }
}

export interface CancelablePromise<T> {
    promise: Promise<T>;
    cancel: () => void;
}

export function cancelablePromise<T>(promise: Promise<T>): CancelablePromise<T> {
    let isCanceled = false;

    const wrappedPromise = new Promise<T>((resolve, reject) => {
        promise.then(
            value => { isCanceled ? reject(new CanceledPromiseError()) : resolve(value); },
            error => { reject(error); }
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            isCanceled = true;
        }
    };
}
