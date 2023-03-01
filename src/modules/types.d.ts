
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
    timer: boolean;
};


export type StorageInfoList = {
    activeMode: Mode;
    useSchedule: boolean;
    infos: StorageInfo[];

};


export type Timer = {
    total: number;
    max: number;
    start: number;
}


export type ListEntry = {
    type: "domain" | "url";
    value: string;
};
export type List = ListEntry[];




export type Settings = {
    isActive: boolean;
};




export type StorageItemMap = {
    schedule: {};
    settings: Settings;
    infoList: StorageInfoList;
}



export type PromiseError = {
    message: Error;
    details?: any;
};








