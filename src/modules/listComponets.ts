import EntriesWrapper from "./wrappers/entriesWrapper";
import TimerWrapper from "./wrappers/timerWrapper";



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
    url: string;
};

export type Entries = Entry[];

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




export type List = {
    info: Info;
    entries: EntriesWrapper;
    timer: TimerWrapper;
};


