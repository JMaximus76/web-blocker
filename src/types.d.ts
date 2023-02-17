


export interface BlockingList {
    mode: String;
    list: Array<ListEntry>;
}




type ListEntry = {
    domain?: string;
    url?: string;
};







export interface Settings {
    isActive: boolean;
    
}

//export type BlockingMode = "blockList" | "allowList";


//export type StorageItem<t> = {[key: string]: t};