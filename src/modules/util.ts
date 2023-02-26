import type { List, Info, PromiseError } from '../modules/types';
import { checkWithListEntry, getList } from './storage';

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



export async function checkMatch(info: Info, url: string): Promise<boolean> {
    if (url === "") return false;
    const list = await getList(info);
    if (list === undefined) {
        const error: PromiseError = {
            message: "getActiveLists() got a list that was undefined",
            details: info
        }
        return Promise.reject(error);
    }

    return checkAgainstLists([list], url);
}