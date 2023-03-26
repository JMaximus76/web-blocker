import type { Entry, EntryList } from "./listComponets";


type EntryMode = "domain" | "fullDomain" | "url" | "exact";

export default class EntryControler {



    list: EntryList = new Proxy([], {
        set: () => {
            throw new Error("EntryControler: was never given a timer");
        },
        get: () => {
            throw new Error("EntryControler: was never given a timer");
        }
    });


    constructor(list?: EntryList) {
        if (list !== undefined) {
            this.list = list;
        }
    }

 


    check(url: string): boolean {
        for (const entry of this.list) {
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
        this.list.push({ mode, value: clipedURL });
    }

    removeEntry(index: number): void {
        if (index < 0 || index >= this.list.length) throw new Error(`removeEntry() was given an index that was out of bounds`);
        this.list.splice(index, 1);
    }

    getIndex(entry: Entry): number {
        return this.list.findIndex((e) => EntryControler.compareEntries(e, entry));
    }

    getEntry(index: number): Entry {
        if (index < 0 || index >= this.list.length) throw new Error(`getEntry() was given an index that was out of bounds`);
        return this.list[index];
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


        if (regex === null) {
            return null;
        } else {
            return regex[regex.length - 1];
        }
        
    }

    static compareEntries(a: Entry, b: Entry): boolean {
        return a.mode === b.mode && a.value === b.value;
    }


}