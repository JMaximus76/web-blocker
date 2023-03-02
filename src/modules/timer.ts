import browser from 'webextension-polyfill';


export default class Timer {


    #id: string;

    #total: number;
    max: number;
    #startTime: number;


    constructor(id: string, { total, max, start}: {total: number, max: number, start: number} ) {
        this.#id = id;
        this.#total = total;
        this.max = max;
        this.#startTime = start;
    }


    start() {
        this.#startTime = Date.now();
        browser.alarms.create(this.#id, {  });
    }

    get startTime(): number {
        return this.#startTime;
    }
    get total(): number {
        return this.#total;
    }
    
}