import type { Entry, EntryList } from "./listComponets";


type EntryMode = "domain" | "fullDomain" | "url" | "exact";

export default class EntryControler {



    // if someone ever forgets to set a list all the methods on this calss with me weird.
    // they'll still work but not like expected and no errors will be thrown.
    // however if I do want errors to be thrown it will take to much time because all
    // the methods on this class are called A LOT
    #list: EntryList = [];


    // DON"T LOCK and also make sawpable list
    constructor(list?: EntryList) {
        if (list !== undefined) {
            this.#list = list;
        }
    }

    setList(list: EntryList) {
        this.#list = list;
    }


    check(url: string): boolean {
        for (const entry of this.#list) {
            const clipedURL = EntryControler.clipURL(entry.mode, url);
            if (clipedURL === entry.value) {
                return true;
            };
        }
        return false;
    }


    addEntry(mode: EntryMode, url: string): void {
        const clipedURL = EntryControler.clipURL(mode, url);
        if (clipedURL === null) throw new Error("addEntry() got null when cliping a url");
        this.#list.push({ mode, value: clipedURL });
    }

    removeEntry(index: number): void {
        if (index < 0 || index >= this.#list.length) throw new Error(`removeEntry() was given an index that was out of bounds`);
        this.#list.splice(index, 1);
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