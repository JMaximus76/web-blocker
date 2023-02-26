import browser from 'webextension-polyfill';
import type {Info, StorageItemMap, InfoList, Settings, PromiseError, List, Mode, ListEntry } from '../modules/types';



export function handelError(error: PromiseError) {
    console.error(error.message);
    if (error.details) console.table(error.details);
}


export function generateDefaultSettings(): Settings {
    return {
        isActive: true
    };
}

export function generateBlankInfoList(): InfoList {
    return {
        activeMode: "block",
        block: [],
        allow: []
    };
}

export function generateInfo(details: Partial<Info>): Info {
    const info: Info = {
        name: details.name ?? "",
        mode: details.mode ?? "block",
        active: details.active ?? false,
        locked: details.locked ?? false
    }

    return info;
}


export async function initStorageItems(): Promise<void> {
    await setStorageItem("settings", generateDefaultSettings());
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
    return (x.mode === y.mode) && (x.name === y.name);
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

function generateStorageKey(info: Info): string {
    return `${info.mode}-${info.name}`;
}



export async function switchActiveMode(): Promise<void> {
    const infoList = await getStorageItem("infoList");
    infoList.activeMode = infoList.activeMode === "block" ? "allow" : "block";
    await setStorageItem("infoList", infoList);
    console.log("mode has been togled");
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
    await browser.storage.local.remove(info.name);
}



function clipURL(type: "domain" | "url", url: string): string | null {
    console.log(`clipURL() was given ${type} and ${url}`);

    let regex: RegExpExecArray | null;
    if (type === "domain") {
        regex = /(?<=:\/\/)[^?#]*\//.exec(url);
    } else {
        regex = /(?<=:\/\/)[^?#]*/.exec(url);
    }

    if (regex === null) return null;
    return regex[0];
}



export async function addListEntry(info: Info, entry: ListEntry): Promise<void> {
    const list = await getList(info);
    if (list === undefined) {
        const error: PromiseError = {
            message: "addListEntry() was given an info that does not have a list in storage",
            details: info
        }
        return Promise.reject(error);
    }

    const clipedEntry = clipURL(entry.type, entry.value);
    if (clipedEntry === null) {
        const error: PromiseError = {
            message: "addListEntry() was given an entry that could not be clipped",
            details: entry
        }
        return Promise.reject(error);
    }


    if (list.some((element) => element.value === clipedEntry)) {
        const error: PromiseError = {
            message: `addListEntry() was given an entry that already exists in ${generateStorageKey(info)}`,
            details: entry
        }
        return Promise.reject(error);
    }

    list.push({ type: entry.type, value: clipedEntry });
    await updateList(info, list);
}



export async function updateList(info: Info, list: List): Promise<void> {
    const infoList = await getStorageItem("infoList");
    if(!isInInfoList(info, infoList)) {
        const error: PromiseError = {
            message: "updateList() was given an info that does not exists in storage",
            details: info
        }
        return Promise.reject(error);
    }

    await browser.storage.local.set({[generateStorageKey(info)]: list});

    //this makes the svelte store to update
    await setStorageItem("infoList", infoList);
}

//this aint tested and I got no clue if it will work so good luck future me
export async function modifyList(info: Info, listId?: string, mode?: Mode): Promise<void> {
    const infoList = await getStorageItem("infoList");

    const index = getIndex(info, infoList);
    if (index === -1) {
        const error: PromiseError = {
            message: "modifyList() was given an info that does not exists in storage",
            details: info
        }
        return Promise.reject(error);
    }

    const list = await getList(info);
    if (list === undefined) {
        const error: PromiseError = {
            message: "modifyList() was given an info that does not existe in storage",
            details: info
        }
        return Promise.reject(error);
    }


    const newInfo: Info = {
        name: listId ?? info.name,
        mode: mode ?? info.mode,
        active: info.active,
        locked: info.locked
    }

    infoList[info.mode].splice(index, 1);
    infoList[newInfo.mode].push(newInfo);

    await browser.storage.local.remove(generateStorageKey(info));
    await browser.storage.local.set({[generateStorageKey(newInfo)]: list});
    await setStorageItem("infoList", infoList);
}


export function checkWithListEntry(entry: ListEntry, url: string): boolean {
    console.log(`checkWithListEntry() was given ${entry.type} and ${entry.value} and ${url}`);
    const clipedUrl = clipURL(entry.type, url);
    return entry.value === clipedUrl;
}


export async function registerNewList(info: Info): Promise<void> {
    if (info.name === "") {
        const error: PromiseError = {
            message: "registerNewList() was given a list with an empty listId",
            details: info
        }
        return Promise.reject(error);
    }


    const infoList = await getStorageItem("infoList");

    if (isInInfoList(info, infoList)) {
        const error: PromiseError = {
            message: "registerNewList() was given a list that alread exists",
            details: info
        }
        return Promise.reject(error);
    }


    infoList[info.mode].push(info);
    await browser.storage.local.set({[generateStorageKey(info)]: []});
    await setStorageItem("infoList", infoList);
}


export async function getList(info: Info) {
    const item: Record<string, (List | undefined)> = await browser.storage.local.get(generateStorageKey(info));
    return item[generateStorageKey(info)];
}




export async function getActiveLists(): Promise<{ mode: Mode, lists: List[]}> {
    const infoList = await getStorageItem("infoList");

    const activeInfos = getActiveInfos(infoList);

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

