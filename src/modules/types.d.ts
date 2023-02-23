

export type Info = {
    readonly listId: string;
    readonly mode: "block" | "allow";
    active: boolean;
    locked: boolean;
};


export type InfoList = {
    activeMode: "block" | "allow";
    block: (BlockInfo)[];
    allow: (AllowInfo)[];

};

export type ListEntry = { domain: string; url?: never; } | { domain?: never; url: string };
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





