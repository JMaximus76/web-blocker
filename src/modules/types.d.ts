
export type Mode = "block" | "allow";



export type UpdateMessageMap = {
    "info": StorageInfo;
    "infos": StorageInfo[];
    "activeMode": Mode;
    "useSchedule": boolean;
};



export type StorageInfo = {
    readonly name: string;
    readonly mode: Mode;
    active: boolean;
    locked: boolean;
    useTimer: boolean;
};


export type StorageInfoList = {
    activeMode: Mode;
    useSchedule: boolean;
    infos: StorageInfo[];

};


export type StorageTimer = {
    total: number;
    max: number;
    start: number | null;
}


export type EntryMode = "domain" | "fullDomain" | "url" | "exact";

export type ListEntry = {
    mode: EntryMode;
    value: string;
};



export type TimerList = string[];




export type StorageSettings = {
    isActive: boolean;
};




export type StorageItemMap = {
    schedule: {};
    settings: StorageSettings;
    infoList: StorageInfoList;
    timerList: TimerList;
}











