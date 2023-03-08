import browser from 'webextension-polyfill';
import type { StorageItemMap } from '../modules/types';
import type { PromiseError } from './util';








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

export async function pullItem(key: string): Promise<any> {
    const item = await browser.storage.local.get(key);
    return item[key];
}



export async function setStorageItem<T extends keyof StorageItemMap>(key: T, item: StorageItemMap[T]): Promise<void> {
    await browser.storage.local.set({ [key]: item });
}


