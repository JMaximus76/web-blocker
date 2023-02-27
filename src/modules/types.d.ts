
export type Mode = "block" | "allow";

export type Info = {
    readonly name: string;
    readonly mode: Mode;
    active: boolean;
    locked: boolean;
    timer?: {
        current: number;
        max: number;
    };
};


export type InfoList = {
    activeMode: Mode;
    block: Info[];
    allow: Info[];

};




export type Timer = {
    time: number;
    start: number;
}


export type ListEntry = {
    type: "domain" | "url";
    value: string;
};

export type List = ListEntry[];


export type Settings = {
};

export type StorageItemMap = {
    active: boolean;
    settings: Settings;
    infoList: InfoList;
}



export type PromiseError = {
    message: Error;
    details?: any;
};








