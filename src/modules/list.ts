import browser from "webextension-polyfill";
import type { ListEntry } from "./types";




export default class List {


    #list: ListEntry[];


    constructor(list: ListEntry[]) {
        this.#list = list;
    }


    static clipURL(type: "domain" | "url", url: string): string | null {
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

    static createEntry(type: "domain" | "url", url: string): ListEntry {
        const value = List.clipURL(type, url);
        if (value === null) throw new Error(`createListEntry() was given an invalid url`);
        return { type, value };
    }


    save(): Promise<void> {
        return browser.storage.local.set({ list: this.#list });
    }


    addEntry(entry: ListEntry): void {
        console.log("in addEntry()");
        console.table(this.#list);
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