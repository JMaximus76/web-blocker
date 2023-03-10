import browser from 'webextension-polyfill';
import type Info from './info';
import type { StorageTimer } from './types';
import { sendMessage, type Message } from './util';


export default class Timer {


    #id: string;

    #total: number;
    #max: number;
    #startTime: number | null;

    
    #bindedOnMessage: ((message: Message) => void) | undefined;


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

    async changeId(info: Info) {
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

    set storage(storage: StorageTimer) {
        this.#total = storage.total;
        this.#max = storage.max;
        this.#startTime = storage.start;
    }


    onMessage(message: Message): void {
        if (message.for === "timer" && message.id === this.#id) {
            this.storage = message.item;
        }
    }

    startListening() {
        this.#bindedOnMessage = this.onMessage.bind(this);
        browser.runtime.onMessage.addListener(this.#bindedOnMessage);
    }

    stopListening() {
        if (this.#bindedOnMessage === undefined) return;
        browser.runtime.onMessage.removeListener(this.#bindedOnMessage);
        this.#bindedOnMessage = undefined;
    }





    async save(): Promise<void> {
        await browser.storage.local.set({ [this.#id]: this.storage });
        const message: Message = { for: "timer", id: this.#id, item: this.storage };
        await sendMessage(message);
    }


    get timeLeft() {
        if (this.#startTime === null) return this.#max - this.#total;
        return this.#max - this.#total - (Date.now() - this.#startTime);
    }



    async start(): Promise<void> {
        this.#startTime = Date.now();
        await this.save();
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