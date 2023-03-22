import type { Timer } from "./listComponets";
import { sendMessage } from "./util";





export default class TimerControler {

    #timer: Timer;


    constructor(timer: Timer) {
        this.#timer = timer;
    }

    get active(): boolean {
        return this.#timer.start !== null;
    }

    get timeLeft(): number {
        if (this.#timer.start === null) return this.#timer.max - this.#timer.total;
        return this.#timer.max - (Date.now() - this.#timer.start);
    }

    get done(): boolean {
        return this.#timer.total >= this.#timer.max;
    }

    start() {
        if (this.#timer.start !== null) return;
        this.#timer.start = Date.now();
        sendMessage("timerStore", "start", this.#timer.id);
    }

    stop() {
        if (this.#timer.start === null) return;
        const timeActive = Date.now() - this.#timer.start;
        this.#timer.total += timeActive;
        this.#timer.start = null;
        sendMessage("timerStore", "stop", this.#timer.id);
    }

    reset() {
        this.#timer.total = 0;

        // this is ok to do because when reset is called we should recheck all tabs
        this.#timer.start = null;
    }

    set max(minutes: number) {
        this.#timer.max = minutes * 60000;
    }

    get max() {
        return this.#timer.max;
    }

    get id() {
        return this.#timer.id;
    }

    


}