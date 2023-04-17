import EntryController from "./controllers/entryController";
import TimerController from "./controllers/timerController";



export type Mode = "block" | "allow";

export type Info = {
    id: string;
    name: string;
    mode: Mode;
    active: boolean;
    locked: boolean;
    useTimer: boolean;
}


export type EntryMode = "domain" | "fullDomain" | "url" | "exact";

export type Entry = {
    mode: EntryMode;

    // I'm not sure if I should keep this because you can alway jsut clip original and this takes up extra storage space
    cliped: string;

    original: string;


    // change so this doesn't get stored in storage (used only in entry controller)
    id: number;
};

export type EntryList = Entry[];

export type Timer = {
    total: number;
    max: number;
    start: number | null;
    id: string;
}



export type ScheduleBlock = {
    start: number;
    end: number;

};

export type Schedule = {
    reversed: boolean;
    blocks: ScheduleBlock[];
    id: string;
}


export function buildList(info: Info, entrys: EntryList, timer: Timer) {
    return {
        info: info,
        entrys: new EntryController(entrys),
        timer: new TimerController(timer)
    };
}

export type List = ReturnType<typeof buildList>;


