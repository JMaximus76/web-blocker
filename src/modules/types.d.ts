



type BaseInfoList = { readonly name: string; };
type BaseBlockInfo = { readonly mode: "block" };
type BaseAllowInfo = { readonly mode: "allow" };

type BlockInfo = BaseInfoList & BaseBlockInfo;
type AllowInfo = BaseInfoList & BaseAllowInfo;


export type InfoDetails = {
    active: boolean;
    locked: boolean;
}

// don't work but I spend like 3 hours on this so its saying for now
// export type Or<T> = {
//     [K in keyof T]: {
//         [L in K]: never;
//     } & {
//         [P in Exclude<keyof T, K>]: T[P];
        
//     };
// }[keyof T];


export type Info = BaseInfoList & (BaseBlockInfo | BaseAllowInfo);


export type InfoList = {
    activeMode: "block" | "allow";
    block: (BlockInfo & InfoDetails)[];
    allow: (AllowInfo & InfoDetails)[];

};

export type ListEntry = { domain: string; url?: never; } | { domain?: never; url: string };

export type Blocklist = {
    info: BlockInfo;
    entrys: ListEntry[];
};

export type Allowlist = {
    info: AllowInfo;
    entrys: ListEntry[];
};


export type Settings = {
    isActive: boolean;
};

export type StorageItemMap = {
    settings: Settings;
    infoList: InfoList;
}



export type PromiseError = {
    error: Error;
    details?: any;
};





