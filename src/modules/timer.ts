import browser from 'webextension-polyfill';
import type Info from './info';
import type { StorageTimer } from './types';


export default class Timer {


    #id: string;

    #total: number;
    #max: number;
    #startTime: number | null;



    constructor(id: string, { total, max, start }: StorageTimer ) {
        this.#id = id;
        this.#total = total;
        this.#max = max;
        this.#startTime = start;
    }




    static async initNewTimer(id: string) {
        const timer = new Timer(id, {total: 0, max: 0, start: null});
        await timer.save();
    }

    async resetId(info: Info) {
        await browser.storage.local.remove(this.#id);
        this.#id = info.timerId;
        await this.save();
    }

    get storage(): StorageTimer {
        return {
            total: this.#total,
            max: this.#max,
            start: this.#startTime,
        }
    }


    async save(): Promise<void> {
        await browser.storage.local.set({ [this.#id]: this.storage });
    }






    start(): number {
        this.#startTime = Date.now();
        this.save();
        return this.#max - this.#total;
    }


    async totalUp(): Promise<void> {
        // in this case the timer was never running so we don't need to total anything up
        if (this.#startTime === null) return;

        const up = Date.now() - this.#startTime;
        // you see what I did here total + up totalUP lol funny 
        this.#total += up;

        this.#startTime = null;
        await this.save();
    }


    isDone(): boolean {
        return this.#total >= this.#max;
    }

    async reset(): Promise<void> {
        this.#total = 0;
        this.#startTime = null;
        await this.save();
    }


    async setMax(minutes: number) {
        this.#max = minutes * 60000;
        await this.save();       
    }

    get max(): number {
        return this.#max/60000
    }



    get id(): string {
        return this.#id;
    }
    
    get startTime(): number | null {
        return this.#startTime;
    }
    get total(): number {
        return this.#total;
    }
    
}