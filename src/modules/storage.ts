import browser from 'webextension-polyfill';
import type {Info, StorageItemMap, InfoList, Settings, PromiseError, List } from '../modules/types';


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

export function generateList(details: Partial<Info>): {info: Info, list: List} {
    const info: Info = {
        listId: details.listId ?? "",
        mode: details.mode ?? "block",
        active: details.active ?? false,
        locked: details.locked ?? false
    }

    const list: List = [];

    return {info: info, list};
}


export async function initStorageItems(): Promise<void> {
    await setStorageItem("settings", generateBlankSettings());
    await setStorageItem("infoList", generateBlankInfoList());
}


export async function getStorageItem<T extends keyof StorageItemMap>(itemKey: T): Promise<StorageItemMap[T]> {
    const item = await browser.storage.local.get(itemKey);

    if (item[itemKey] === undefined) {
        const error: PromiseError = {
            message: `getStorageItem tried to get an item and got undefined. THIS IS VERY BAD`,
            details: itemKey
        }
        return Promise.reject(error);
    }

    return item[itemKey];
}

async function setStorageItem<T extends keyof StorageItemMap>(key: T, item: StorageItemMap[T]): Promise<void> {
    await browser.storage.local.set({ [key]: item });
    //await browser.runtime.sendMessage({ type: key, item: item});
}




export async function updateInfo(info: Info): Promise<void> {
    const infoList = await getStorageItem("infoList");
    const index = getIndex(info, infoList);
   

    if (index === -1) {
        const error: PromiseError = {
            message: "updateInfo() was given an info that does not exists in storage",
            details: info
        }
        return Promise.reject(error);
    }

    infoList[info.mode][index] = info;

    await setStorageItem("infoList", infoList);
}




export function compairInfo(x: Info, y: Info): boolean {
    return (x.mode === y.mode) && (x.listId === y.listId);
};

export function isInInfoList(info: Info, infoList: InfoList): boolean {
    return infoList[info.mode].some((entry: Info) => compairInfo(info, entry));
}

export function getActiveInfos(infoList: InfoList): Info[] {
    const active: Info[] = [];
    infoList[infoList.activeMode].forEach((info: Info) => {
        if (info.active) active.push(info);
    });
    return active;
}

export function getIndex(info: Info, infoList: InfoList): number {
    return infoList[info.mode].findIndex((element) => compairInfo(info, element));
}


export async function togleActiveMode(): Promise<void> {
    const infoList = await getStorageItem("infoList");
    infoList.activeMode = infoList.activeMode === "block" ? "allow" : "block";
    await setStorageItem("infoList", infoList);
}



export async function removeList(info: Info): Promise<void> {
    const infoList = await getStorageItem("infoList");
    const index = getIndex(info, infoList);
    if (index === -1) {
        const error: PromiseError = {
            message: "removeList() was given an info that does not exists in storage",
            details: info
        }
        return Promise.reject(error);
    }

    infoList[info.mode].splice(index, 1);
    await setStorageItem("infoList", infoList);
    await browser.storage.local.remove(info.listId);
}


export async function updateList(info: Info, updatedList: List): Promise<void> {
    const infoList = await getStorageItem("infoList");
    if(!isInInfoList(info, infoList)) {
        const error: PromiseError = {
            message: "updateList() was given an info that does not exists in storage",
            details: info
        }
        return Promise.reject(error);
    }

    await browser.storage.local.set({[info.listId]: updatedList});
}



export async function registerNewList({info, list}: {info: Info, list: List}): Promise<void> {
    const infoList = await getStorageItem("infoList");

    if (isInInfoList(info, infoList)) {
        const error: PromiseError = {
            message: "registerNewList() was given a list that alread exists",
            details: info
        }
        return Promise.reject(error);
    }


    infoList[info.mode].push(info);
    await setStorageItem("infoList", infoList);
    await browser.storage.local.set({[info.listId]: list});
}






async function getList(info: Info) {
    const item: Record<string, (List | undefined)> = await browser.storage.local.get(info.listId);
    return item[info.listId];
}


export async function getActiveLists(): Promise<{mode: "block" | "allow", lists: List[]}> {
    const infoList = await getStorageItem("infoList");

    const activeInfos = getActiveInfos(infoList);
    console.table(activeInfos);

    const activeLists: List[] = [];

    for(const info of activeInfos) {
        const list = await getList(info);
        if (list === undefined) {
            const error: PromiseError = {
                message: "getActiveLists() got a list that was undefined",
                details: info
            }
            return Promise.reject(error);
        }
        activeLists.push(list);
    }

    return {mode: infoList.activeMode, lists: activeLists};
}

