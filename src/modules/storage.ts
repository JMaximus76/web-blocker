import browser from 'webextension-polyfill';
import type { StorageItemMap, PromiseError, ListEntry, Timer } from '../modules/types';





export function handelError(error: PromiseError) {
    console.error(error.message);
    if (error.details) console.table(error.details);
}





export async function getStorageItem<T extends keyof StorageItemMap>(itemKey: T): Promise<StorageItemMap[T]> {
    const item = await browser.storage.local.get(itemKey);

    if (item[itemKey] === undefined) {
        const error: PromiseError = {
            message: new Error(`getStorageItem tried to get an item and got undefined. THIS IS VERY BAD`),
            details: itemKey
        }
        return Promise.reject(error);
    }

    return item[itemKey];
}

export async function setStorageItem<T extends keyof StorageItemMap>(key: T, item: StorageItemMap[T]): Promise<void> {
    await browser.storage.local.set({ [key]: item });
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




export function checkWithListEntry(entry: ListEntry, url: string): boolean {
    console.log(`checkWithListEntry() was given ${entry.type} and ${entry.value} and ${url}`);
    const clipedUrl = clipURL(entry.type, url);
    return entry.value === clipedUrl;
}



async function getTimers(): Promise<{ [key: string]: Timer }> {
    const alarms = await browser.alarms.getAll();
    const names = alarms.map((alarm) => alarm.name);
    const timers: { [key: string]: Timer } = {};

    for (const name of names) {
        const item = await browser.storage.local.get(name);
        await browser.storage.local.remove(name);
        timers[name] = item[name];
    }

    return timers;
}

