import type { ScheduleBlock } from "../listComponets";





export default class Block {

    #block: ScheduleBlock;

    constructor(block: ScheduleBlock) {
        this.#block = block;
    }



    isActive(time: number) {
        return time
    }



}