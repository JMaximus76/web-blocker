import type { Timer } from "../listComponets";
import { sendMessage } from "../util";





export default class TimerController {



    timer: Timer = new Proxy({} as Timer, {
        set: () => {
            throw new Error("TimerController was never given a timer");
        },
        get: () => {
            throw new Error("TimerController was never given a timer");
        }
    });


    constructor(timer?: Timer) {
        if (timer !== undefined) this.timer = timer;
    }

    
    get active(): boolean {
        return this.timer.start !== null;
    }

    get timeLeft(): number {
        return this.timer.max - this.timer.total - (this.timer.start === null ? 0 : (Date.now() - this.timer.start));
    }

    get done(): boolean {
        return this.timer.total >= this.timer.max;
    }

    start() {
        if (this.timer.start !== null) return;
        this.timer.start = Date.now();
        sendMessage("timerStore", "start", this.timer.id);
    }

    stop() {
        if (this.timer.start === null) return;
        const timeActive = Date.now() - this.timer.start;
        this.timer.total += timeActive;
        this.timer.start = null;
        sendMessage("timerStore", "stop", this.timer.id);
    }

    reset() {
        this.timer.total = 0;
        // this is ok to do because when reset is called we should recheck all tabs
        this.timer.start = null;
    }

    set max(minutes: number) {
        this.timer.max = minutes * 60000;
    }

    get max() {
        return this.timer.max;
    }

    get id() {
        return this.timer.id;
    }

    


}