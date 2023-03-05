import browser from "webextension-polyfill";
import type Info from "./info";
import type { ListEntry } from "./types";




export default class List {

    #id: string;
    #list: ListEntry[];
    


    constructor(id: string, list: ListEntry[]) {
        this.#id = id;
        this.#list = list;
    }


    static clipURL(type: "domain" | "url", url: string): string | null {

        let regex: RegExpExecArray | null;
        if (type === "domain") {
           regex = /(?<=:\/\/)[^?#]*\//.exec(url);
        } else {
            regex = /(?<=:\/\/)[^?#]*/.exec(url);
        }

        if (regex === null) return null;
        return regex[0];
    }

    static createEntry(type: "domain" | "url", url: string): ListEntry {
        const value = List.clipURL(type, url);
        if (value === null) throw new Error(`createListEntry() was given an invalid url`);
        return { type, value };
    }

    get storage(): ListEntry[] {
        return this.#list
    }

    async resetId(info: Info) {
        await browser.storage.local.remove(this.#id);
        this.#id = info.listId;
        await this.save();
    }


    async save(): Promise<void> {
        await browser.storage.local.set({ [this.#id]: this.#list });
    }


    addEntry(entry: ListEntry): void {
        this.#list.push(entry);
    }

    removeEntry(index: number): void {
        if (index < 0 || index >= this.#list.length) throw new Error(`removeEntry() was given an index that was out of bounds`);
        this.#list.splice(index, 1);
    }

    getIndex(entry: ListEntry): number {
        return this.#list.indexOf(entry);
    }

    getEntry(index: number): ListEntry {
        if (index < 0 || index >= this.#list.length) throw new Error(`getEntry() was given an index that was out of bounds`);
        return this.#list[index];
    }

    check(url: string): boolean {
        for (const entry of this.#list) {
            if (List.clipURL(entry.type, url) === entry.value) return true;
        }
        return false;
    }

    
}