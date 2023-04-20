import type { Schedule, ScheduleBlock } from "../listComponets";



type Weekday = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";



// NEED TO ADD: handelers for adding and deleting props on storage proxyes ;-; pain peko


export default class ScheduleWrapper {

    #schedule: Schedule;


    constructor(schedule: Schedule) {
        this.#schedule = schedule;
    }


    
    toggleWeekDay(day: Weekday) {
        if (this.#schedule.days[day] !== undefined) {
            delete this.#schedule.days[day];
        } else {
            this.#schedule.days[day] = [];
        }
    }

    newBlock(day: Weekday, block: ScheduleBlock) {
        if (this.#schedule.days[day] === undefined) throw new Error("ScheduleWrapper had newBlock called on a week day that was not defined");

        return this.#schedule.days[day]!.push(block) - 1;
    }

    deleteBlock(day: Weekday, index: number) {
        if (this.#schedule.days[day] === undefined) throw new Error("ScheduleWrapper had deleteBlock called on a week day that was not defined");
        if (0 > index || index >= this.#schedule.days[day]!.length) throw new Error("ScheduleWrapper received an invalid index with deleteBlock")
        
        
    }



    check() {
        const date = new Date();
        const weekday = this.#getWeekDay(date)
        const timeSinceDayStart = this.#getTimeSinceDayStart(date);

        let match: boolean;

        if (this.#schedule.days[weekday] !== undefined) {
            match = this.#checkBlocks(this.#schedule.days[weekday]!, timeSinceDayStart);
        } else if (this.#schedule.global !== undefined) {
            match = this.#checkBlocks(this.#schedule.global, timeSinceDayStart);
        } else {
            return true;
        }

        return match !== this.#schedule.reversed;
    }

    #checkBlocks(blocks: ScheduleBlock[], milliseconds: number) {
        for (const block of blocks) {
            if (block.start <= milliseconds && milliseconds <= block.end) {
                return true;
            }
        }

        return false;
    }

    #getWeekDay(date: Date): Weekday {
        return ["mo", "tu", "we", "th", "fr", "sa", "su"][date.getDay()] as Weekday;
    }

    #getTimeSinceDayStart(date: Date): number {
        const millisecondsinDay = 1000 * 60 * 60 * 24;
        return date.getTime() % millisecondsinDay; 
    }
    


    get days() {
        return 
    }

    get id() {
        return this.#schedule.id;
    }

    get reversed() {
        return this.#schedule.reversed;
    }

    toggleReversed() {
        this.#schedule.reversed = !this.#schedule.reversed
    }
    
    
}