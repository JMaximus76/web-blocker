


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




export type Timer = {
    total: number;
    max: number;
    start: number | null;
}