import browser from 'webextension-polyfill';
import type { Blocklist, Allowlist, Info, StorageItemMap, InfoList, Settings, PromiseError, InfoDetails, ListEntry } from '../modules/types';


function generateBlankSettings(): Settings {
    return {
        isActive: true
    };
}

function generateBlankInfoList(): InfoList {
    return {
        activeMode: "block",
        block: [],
        allow: []
    };
}


export async function initStorageItems(): Promise<void> {
    await setStorageItem("settings", generateBlankSettings());
    await setStorageItem("infoList", generateBlankInfoList());
}


export async function getStorageItem<T extends keyof StorageItemMap>(itemKey: T): Promise<StorageItemMap[T]> {
    const item = await browser.storage.local.get(itemKey);

    if (Object.values(item)[0] === undefined) {
        const error: PromiseError = {
            error: new Error(`getStorageItem tried to get an item and got undefined. THIS IS VERY BAD`),
            details: itemKey
        }
        return Promise.reject(error);
    }

    return Object.values(item)[0];
}

async function setStorageItem<T extends keyof StorageItemMap>(key: T, item: StorageItemMap[T]): Promise<void> {
    return await browser.storage.local.set({ [key]: item });
}




export async function updateInfo(info: Info, details: Partial<InfoDetails>): Promise<void> {
    if (Object.keys(details).length === 0) return;
    const infoList = await getStorageItem("infoList");
    const index = infoList[info.mode].findIndex((element) => compairInfo(info, element));
   

    if (index === -1) {
        const error: PromiseError = {
            error: new Error("updateInfo() was given an info that does not exists in storage"),
            details: info
        }
        return Promise.reject(error);
    }


   

    for (const key in details) {
        details[key as keyof InfoDetails] ??= infoList[info.mode][index][key as keyof InfoDetails];    
    }



    infoList[info.mode][index] = {
        ...info,
        ...details as InfoDetails
    };

    await setStorageItem("infoList", infoList);
}




export function compairInfo(x: Info, y: Info): boolean {
    return (x.mode === y.mode) && (x.name === y.name);
};

export function checkAgainstInfo(info: Info, infoList: InfoList): boolean {
    return infoList[info.mode].some((entry: Info) => compairInfo(info, entry));
}

export function getActiveInfos(infoList: InfoList): Info[] {
    const list: Info[] = [];
    infoList[infoList.activeMode].forEach((info: Info & InfoDetails) => {
        if (info.active) list.push(info);
    });
    return list;
}


export async function togleActiveMode(): Promise<void> {
    const infoList = await getStorageItem("infoList");
    infoList.activeMode = infoList.activeMode === "block" ? "allow" : "block";
    await setStorageItem("infoList", infoList);
}





// not sure I'll need this
// async function checkForInfo(info: Info): Promise<boolean> {
//     const infoList = await getStorageItem("infoList");
//     return infoList[info.mode].some((entry: Info) => compairInfo(info, entry));
// }




export async function removeList(info: Info): Promise<void> {
    const infoList = await getStorageItem("infoList");
    const index = infoList[info.mode].findIndex((element) => compairInfo(info, element));
    if (index === -1) {
        const error: PromiseError = {
            error: new Error("removeList() was given an info that does not exists in storage"),
            details: info
        }
        return Promise.reject(error);
    }

    infoList[info.mode].splice(index, 1);
    await setStorageItem("infoList", infoList);
    await browser.storage.local.remove(info.name);
}


export async function updateListEntrys(info: Info, entrys: ListEntry[]): Promise<void> {
    const list = await getList(info);
    if (list === undefined) {
        const error: PromiseError = {
            error: new Error("updateListEntrys() was given an Info that does not resolve to a list"),
            details: info
        }
        return Promise.reject(error);
    }

    list.entrys = entrys;

    await browser.storage.local.set({[list.info.name]: list});
}




export async function registerNewList(list: Blocklist | Allowlist): Promise<void> {
    const infoList = await getStorageItem("infoList");
    if (checkAgainstInfo(list.info, infoList)) {
        const error: PromiseError = {
            error: new Error("registerNewList() was given a list that alread exists"),
            details: list
        }
        return Promise.reject(error);
    }

    (infoList[list.info.mode] as Info[]).push(list.info);
    await setStorageItem("infoList", infoList);
    await browser.storage.local.set({[list.info.name]: list});
}






async function getList(info: Info) {
    const list: Record<string, (Blocklist | Allowlist | undefined)> = await browser.storage.local.get(info.name);
    return Object.values(list)[0];
}


export async function getActiveLists(): Promise<Blocklist[] | Allowlist[]> {
    const infoList = await getStorageItem("infoList");

    const activeLists = [];

    for (const info of infoList[infoList.activeMode]) {
        if (info.active) {
            const list = await getList(info);
            if (list === undefined) {
                const error: PromiseError = {
                    error: new Error("getActiveLists() tried to get a list with infoList that did not exist in storage. THIS IS VERY BAD"),
                    details: info
                }
                return Promise.reject(error);
            }
            activeLists.push(list);
        }
    }

    return activeLists as (Blocklist[] | Allowlist[]);

}

