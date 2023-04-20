import type { Entry } from "../listComponets";
import EntryWrapper from "./entryWrapper";
import WrapperFactory from "./wrapperFactory";




type EntryMode = "domain" | "fullDomain" | "url" | "exact";







export default class EntriesWrapper {


    #entries: Entry[];
    #customEntries: EntryWrapper[];
    #factory = new WrapperFactory<Entry, EntryWrapper>(entry => new EntryWrapper(entry));

    constructor(entries: Entry[]) {
        this.#entries = entries;
        this.#customEntries = entries.map(entry => this.#factory.build(entry));
    }


    get iterable() {
        return this.#customEntries;
    }




    addEntry(mode: EntryMode, url: string): void {
        const clipedURL = EntryWrapper.clipURL(mode, url);
        if (clipedURL === null) throw new Error("addEntry() got null when cliping a url");

        const entry: Entry = {
            mode: mode,
            url: url
        }

        this.#entries.push(entry);
        this.#customEntries.push(this.#factory.build(entry));
    }

    removeEntry(index: number): void {
        if (index < 0 || index >= this.#entries.length) throw new Error(`removeEntry() was given an index that was out of bounds`);
        this.#entries.splice(index, 1);
        this.#customEntries.splice(index, 1);
    }

    

    
    check(url: string): boolean {

        const clips: {[key in EntryMode]?: string | null} = {};

        for (const entry of this.#customEntries) {
            if ((clips[entry.mode] ??= EntryWrapper.clipURL(entry.mode, url)) === entry.cliped) {
                return true;
            }
        }
        return false;
    }

    








    // get list() {
    //     const proxy: EntryList = [];

    //     for (const entry of this.#list) {
    //         proxy.push(new Proxy(entry, {

    //             set: (target, prop, value) => {

    //                 switch (prop as keyof Entry) {
    //                     case "mode": {
    //                         const newClip = EntriesWrapper.clipURL(value, target.original);
    //                         if (newClip === null) throw new Error("EntryConteroler: when updating an Entry for 'mode' got null after cliping");
    //                         target.mode = value;
    //                         target.cliped = newClip;
    //                         break;
    //                     }

    //                     case "original": {
    //                         const newClip = EntriesWrapper.clipURL(target.mode, value);
    //                         if (newClip === null) throw new Error("EntryController: when updating an Entry for 'original' got null after cliping");
    //                         target.original = value;
    //                         target.cliped = newClip;
    //                         break;
    //                     }

    //                     case "cliped": {
    //                         throw new Error("EntryController: can't set 'cliped' directly");
    //                     }
    //                 }


    //                 return true;
    //             }
    //         }));
    //     }

    //     return proxy;
    // }


}