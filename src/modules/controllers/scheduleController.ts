import type { Schedule, ScheduleBlock } from "../listComponets";





export default class ScheduleController {

    #schedule: Schedule = new Proxy({} as Schedule, {
        set: () => {
            throw new Error("ScheduleController: was never given a schedule");
        },

        get: () => {
            throw new Error("ScheduleController: was never given a schedule");
        }
    });


    constructor(schedule?: Schedule) {
        if (schedule !== undefined) this.#schedule = schedule;
    }

    get blocks() {
        return new Proxy(this.#schedule.blocks, {
            set: (t, k, v, r) => {
                Reflect.set(t, k, v, r);
                if (k === "length") {
                    // should trigger the prox to update
                    this.#schedule.blocks = t;
                }

                return true;
            }  
        });
    }
    
}