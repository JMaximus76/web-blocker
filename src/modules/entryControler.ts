import type { Entry, EntryList } from "./listComponets";
import { jsonCopy } from "./util";

type EntryMode = "domain" | "fullDomain" | "url" | "exact";

export default class EntryControler {


    //                        sad
    #list: EntryList | readonly Entry[];
    #record: Record<string, boolean> = {};

    constructor(list: EntryList, lock: boolean = false) {
        this.#list = list;
        if (lock) this.#list = Object.freeze(jsonCopy(this.#list));
    }

    


    check(url: string): boolean {
        let isMatch = false;

        for (const entry of this.#list) {
            const clipedURL = EntryControler.clipURL(entry.mode, url);
            // I don't think we care if its null becuase it will just return false (null for things like about:blank)
            // extension will not support blocking any url except for http and https (because I'm lazy)
            if (clipedURL === entry.value) {
                isMatch = true;
                break;
            };
        }
        
        if (Object.isFrozen(this.#list)) this.#record[url] = isMatch;
        return isMatch;
    }


    addEntry(mode: EntryMode, url: string): void {
        if (Object.isFrozen(this.#list)) throw new Error(`addEntry() was called on a locked list`);
        (this.#list as EntryList).push({ mode, value: url });
    }

    removeEntry(index: number): void {
        if (Object.isFrozen(this.#list)) throw new Error(`removeEntry() was called on a locked list`);
        if (index < 0 || index >= this.#list.length) throw new Error(`removeEntry() was given an index that was out of bounds`);
        (this.#list as EntryList).splice(index, 1);
    }

    getIndex(entry: Entry): number {
        return this.#list.findIndex((e) => EntryControler.compareEntries(e, entry));
    }

    getEntry(index: number): Entry {
        if (index < 0 || index >= this.#list.length) throw new Error(`getEntry() was given an index that was out of bounds`);
        return this.#list[index];
    }





    static clipURL(mode: EntryMode, url: string): string | null {
        if (mode === "exact") return url;

        let regex: RegExpExecArray | null = null;

        // yes, I know these regexes are terrible, I'm sorry
        if (mode === "fullDomain") {
            regex = /(?<=:\/\/)(?:[\w-]*\.)?([\w-]*\.[\w-]*)/.exec(url);
        } else if (mode === "domain") {
            regex = /(?<=:\/\/)[^?#\/]*(?=\/)?/.exec(url);
        } else if (mode === "url") {
            regex = /(?<=:\/\/)[^?#]*/.exec(url);
        }

        if (regex === null) return null;
        return regex[regex.length - 1];
    }

    static compareEntries(a: Entry, b: Entry): boolean {
        return a.mode === b.mode && a.value === b.value;
    }


}