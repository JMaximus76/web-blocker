
type BaseListInfo = { readonly name: string; };
type BaseBlockInfo = { readonly mode: "blocklist" };
type BaseAllowInfo = { readonly mode: "allowlist" };


type BlockInfo = BaseListInfo & BaseBlockInfo;
type AllowInfo = BaseListInfo & BaseAllowInfo;
export type Info = BaseListInfo & (BaseBlockInfo | BaseAllowInfo);



export type InfoList = {
    current: BlockInfo[] | AllowInfo[];
    all: {
        blocklist: BlockInfo[];
        allowlist: AllowInfo[];
    };
};

export type Blocklist = {
    info: BlockInfo;
    list: Array<{ domain: string; url?: never; } | { domain?: never; url: string }>;
};

export type Allowlist = {
    info: AllowInfo;
    list: Array<{ domain: string; url?: never; } | { domain?: never; url: string }>;
};





export type Settings = {
    isActive: boolean;
};




type StorageItemMap = {
    "settings" : Settings,
    "infoList" : InfoList
}

export type StorageName = keyof StorageItemMap;

export type StorageItem = {
    [key in StorageName]: {
        name: key,
        item: StorageItemMap[key]
    }
}[StorageName];


