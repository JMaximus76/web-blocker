


export interface BlockingList {
    mode: String;
    list: Array<ListEntry>;
}

export type ListEntry = { url: string } | { domain: string };

export interface Settings {
    isActive: boolean;
    
}

//export type BlockingMode = "blockList" | "allowList";


export type StorageItem<t> = {[key: string]: t};