import browser from 'webextension-polyfill';
import type Info from './info';
import type { StorageTimer } from './types';


export default class Timer {


    #id: string;

    #total: number;
    max: number;
    #startTime: number;


    constructor(id: string, { total, max, start }: StorageTimer ) {
        this.#id = id;
        this.#total = total;
        this.max = max;
        this.#startTime = start;
    }


    start() {
        this.#startTime = Date.now();
        browser.alarms.create(this.#id, {  });
    }

    async resetId(info: Info) {
        await browser.storage.local.remove(this.#id);
        this.#id = info.timerId;
        await this.save();
    }


    async save(): Promise<void> {
        await browser.storage.local.set({ [this.#id]: this.storage });
    }
    
    get storage(): StorageTimer {
        return {
            total: this.#total,
            max: this.max,
            start: this.#startTime,
        }
    }

    get startTime(): number {
        return this.#startTime;
    }
    get total(): number {
        return this.#total;
    }
    
}