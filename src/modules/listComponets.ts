import EntryController from "./entryController";
import TimerController from "./timerController";



export type Mode = "block" | "allow";

export type Info = {
    readonly id: string;
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
    id: number;
};

export type EntryList = Entry[];

export type Timer = {
    total: number;
    max: number;
    start: number | null;
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


