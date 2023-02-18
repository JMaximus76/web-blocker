import browser from 'webextension-polyfill';
import type { InfoList, Blocklist, Allowlist, Info, StorageName, StorageItem } from '../modules/types';


export async function getStorageItem(itemName: StorageName): Promise<any> {
    const item = await browser.storage.local.get(itemName);

    if (item === undefined) {
        return Promise.reject(new Error("tried to get an object out of storage.local in getStorageItem and got undefined. THIS IS VERY BAD"));
    }

    return Object.values(item)[0];
}

export async function setStorageItem(storage: StorageItem): Promise<void> {
    return browser.storage.local.set({ [storage.name]: storage.item });
}


export async function getList(info: Info): Promise<Blocklist | Allowlist> {
    const list = await browser.storage.local.get(info.name);

    if (list === undefined) {
        return Promise.reject(new Error(`When getting a list getList got undefined. Tried with this list name ${info.name}`));
    }

    return Object.values(list)[0];

}

// export async function setNewList(list: Blocklist | Allowlist): Promise<void> {
//     const infoList: InfoList = await getStorageItem("infoList");
//     infoList.all
// }


export async function getCurrentLists(): Promise<(Blocklist | Allowlist)[]> {
    const infoList: InfoList = await getStorageItem("infoList");

    let currentLists: (Blocklist | Allowlist)[] = [];
    for (const info of infoList.current) {
        const list = await getList(info);
        currentLists.push(list);
    }

    return currentLists;
}



//NEED TO ADD


// export async function isList(info: Info): Promise<boolean> {

// }

// export async function removeList(info: Info): Promise<void> {

// }