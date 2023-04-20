import type { Entry, EntryMode } from "../listComponets";





export default class EntryWrapper {
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
        return this.#clip ??= EntryWrapper.clipURL(this.mode, this.url);
    }



    static clipURL(mode: EntryMode, url: string): string | null {
        let regex: RegExpExecArray | null = null;

        switch (mode) {
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
}