import EntryControler from "./entryControler";
import TimerControler from "./timerControler";



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
    value: string;
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
        entrys: new EntryControler(entrys),
        timer: new TimerControler(timer)
    };
}

export type List = ReturnType<typeof buildList>;