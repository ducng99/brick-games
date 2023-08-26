import { compress, decompress } from 'lz-string';
import type { Subscriber, Unsubscriber, Updater, Writable } from 'svelte/store';

export class PersistentStore<T> implements Writable<T> {
    private readonly _key: string;
    private _value: T;

    private readonly _subscriptions: Array<Subscriber<T>> = [];

    /**
     * Creates a writable store that persists its value in the local storage
     * @param key Key for the local storage
     * @param value Default value. This value will be overwritten by the value in the local storage if it exists
     * @returns A writable store that persists its value in the local storage
     */
    constructor(key: string, value: T) {
        this._key = key;
        this._value = value;

        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                this._value = JSON.parse(decompress(storedValue));
            } catch {
                this.value = value;
            }
        } else {
            this.value = value;
        }
    }

    public get value() {
        return this._value;
    }

    private set value(value: T) {
        this._value = value;
        this._subscriptions.forEach(subscription => { subscription(value); });
        localStorage.setItem(this._key, compress(JSON.stringify(value)));
    }

    public subscribe(subscription: Subscriber<T>): Unsubscriber {
        subscription(this.value);

        this._subscriptions.push(subscription);

        return () => {
            const index = this._subscriptions.indexOf(subscription);
            if (index !== -1) {
                this._subscriptions.splice(index, 1);
            }
        };
    }

    public set(value: T) {
        this.value = value;
    }

    public update(updater: Updater<T>) {
        this.value = updater(this.value);
    }
}
