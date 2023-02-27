import browser from "webextension-polyfill";
import type { List, Info, PromiseError } from '../modules/types';
import { checkWithListEntry, getList, generateStorageKey, getActiveInfos, getStorageItem, liftTimers, generateTimer } from './storage';



//checks if the given url is matched by any of the lists
export function checkAgainstLists(lists: List[], url: string): boolean {
    for (const list of lists) {
        for (const entry of list) {
            if (checkWithListEntry(entry, url)) {
                return true;
            }
        }
    }

    return false;
}


//checks if the given url is matched by the info's list
export async function checkMatch(info: Info, url: string): Promise<boolean> {
    if (url === "") return false;
    const list = await getList(info);
    if (list === undefined) {
        const error: PromiseError = {
            message: new Error("getActiveLists() got a list that was undefined"),
            details: info
        }
        return Promise.reject(error);
    }

    return checkAgainstLists([list], url);
}




//returns a list of all the infos that have lists that match the given url
export async function getMatchedInfos(infos: Info[], url: string): Promise<Info[]> {
    const matchedInfos: Info[] = [];

    for (const info of infos) {
        if (await checkMatch(info, url)) {
            matchedInfos.push(info);
        }
    }

    return matchedInfos;
}



function generateTimerKey(info: Info): string {
    return `timer-${info.mode}-${info.name}`;
}


// sets alarms for all the infos that match the given url
export async function setTimers(url: string) {
    await liftTimers();

    const matchedInfos = await getMatchedInfos(getActiveInfos(await getStorageItem("infoList")), url);

    const now = Date.now();

    for (const info of matchedInfos) {
        if (info.timer && info.timer.current < info.timer.max) {
            browser.alarms.create(generateStorageKey(info), { periodInMinutes: 1 });
            await browser.storage.local.set({ [generateTimerKey(info)]: generateTimer(now) });
        }
    }


        
}



