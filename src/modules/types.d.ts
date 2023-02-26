
export type Mode = "block" | "allow";

export type Info = {
    readonly name: string;
    readonly mode: Mode;
    active: boolean;
    locked: boolean;
};


export type InfoList = {
    activeMode: Mode;
    block: Info[];
    allow: Info[];

};


export type ListEntry = {
    type: "domain" | "url";
    value: string;
};

export type List = ListEntry[];


export type Settings = {
    isActive: boolean;
};

export type StorageItemMap = {
    settings: Settings;
    infoList: InfoList;
}



export type PromiseError = {
    message: string;
    details?: any;
};








