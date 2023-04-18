import type { Entry } from "../listComponets";
import WrapperFactory from "./wrapperFactory";




type EntryMode = "domain" | "fullDomain" | "url" | "exact";



class CustomEntry {
    //static #idCounter = 0;
    //#id: number = CustomEntry.#idCounter++;
    #entry: Entry;
    #clip: string | null = null;

    constructor(entry: Entry) {
        this.#entry = entry;
    }

    get mode() {
        return this.#entry.mode;
    }

    set mode(value: EntryMode) {
        if (this.#clip !== null) this.#clip = null;
        this.#entry.mode = value;
    }

    get url() {
        return this.#entry.url;
    }

    set url(value: string) {
        if (this.#clip !== null) this.#clip = null;
        this.#entry.url = value;
    }

    get cliped() {
        return this.#clip ??= EntriesWrapper.clipURL(this.mode, this.url);
    }
}



export default class EntriesWrapper {


    #entries: Entry[];
    #customEntries: CustomEntry[] | null = null;
    #factory = new WrapperFactory<Entry, CustomEntry>(entry => new CustomEntry(entry));

    constructor(entries: Entry[]) {
        this.#entries = entries;
    }


    get iterable() {
        return this.#customEntries ??= this.#entries.map(entry => this.#factory.build(entry));
    }


    addEntry(mode: EntryMode, url: string): void {
        const clipedURL = EntriesWrapper.clipURL(mode, url);
        if (clipedURL === null) throw new Error("addEntry() got null when cliping a url");

        const entry: Entry = {
            mode: mode,
            url: url
        }

        this.#entries.push(entry);
        if (this.#customEntries) this.#customEntries.push(this.#factory.build(entry));
    }

    removeEntry(index: number): void {
        if (index < 0 || index >= this.#entries.length) throw new Error(`removeEntry() was given an index that was out of bounds`);
        this.#entries.splice(index, 1);
        if(this.#customEntries) this.#customEntries.splice(index, 1);
    }

    

    
    check(url: string): boolean {

        const clips: {[key in EntryMode]?: string | null} = {};

        for (const entry of this.iterable) {
            if ((clips[entry.mode] ??= EntriesWrapper.clipURL(entry.mode, url)) === entry.cliped) {
                return true;
            }
        }
        return false;
    }

    static clipURL(mode: EntryMode, url: string): string | null {
        let regex: RegExpExecArray | null = null;

        switch(mode) {
            case "fullDomain":
                regex = /(?<=:\/\/)(?:[\w-]*\.)?([\w-]*\.[\w-]*)/.exec(url);
                break;
            case "domain":
                regex = /(?<=:\/\/)[^?#\/]*(?=\/)?/.exec(url);
                break;
            case "url":
                regex = /(?<=:\/\/)[^?#]*/.exec(url);
                break;
            case "exact":
                return url;
        }

        return regex === null ? null : regex[regex.length - 1];
        
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