import type { Entry, EntryList } from "./listComponets";


type EntryMode = "domain" | "fullDomain" | "url" | "exact";

export default class EntryController {



    #list: EntryList = new Proxy([], {
        set: () => {
            throw new Error("EntryController: was never given a timer");
        },
        get: () => {
            throw new Error("EntryController: was never given a timer");
        }
    });


    get list() {
        const proxy: EntryList = [];

        for (const entry of this.#list) {
            proxy.push(new Proxy(entry, {

                set: (target, prop, value) => {

                    switch (prop as keyof Entry) {
                        case "mode": {
                            const newClip = EntryController.clipURL(value, target.original);
                            if (newClip === null) throw new Error("EntryConteroler: when updating an Entry for 'mode' got null after cliping");
                            target.mode = value;
                            target.cliped = newClip;
                            break;
                        }

                        case "original": {
                            const newClip = EntryController.clipURL(target.mode, value);
                            if (newClip === null) throw new Error("EntryController: when updating an Entry for 'original' got null after cliping");
                            target.original = value;
                            target.cliped = newClip;
                            break;
                        }

                        case "cliped": {
                            throw new Error("EntryController: can't set 'cliped' directly");
                        }


                        case "id": {
                            throw new Error("EntryController: can't set 'id' directly");
                        }
                    }

                    // should trick the storage proxy into saving the list
                    this.#list.length = this.#list.length;
                    return true;
                }
            }));
        }

        return proxy;
    }

    set list(list: EntryList) {
        this.#list = list;
    }


    constructor(list?: EntryList) {
        if (list !== undefined) {
            this.#list = list;
        }
    }

    check(url: string): boolean;
    check(clipsOrUrl: ReturnType<typeof EntryController.allClips> | string): boolean {
        const clips = (typeof clipsOrUrl === "string") ? EntryController.allClips(clipsOrUrl) : clipsOrUrl;

        for (const entry of this.#list) {
            if (clips[entry.mode] === entry.cliped) {
                return true;
            };
        }
        return false;
    }


    addEntry(mode: EntryMode, url: string): void {
        const clipedURL = EntryController.clipURL(mode, url);
        if (clipedURL === null) throw new Error("addEntry() got null when cliping a url");

        const entry: Entry = {
            mode: mode,
            cliped: clipedURL,
            original: url,
            id: (this.#list.at(-1) !== undefined) ? this.#list.at(-1)!.id + 1 : 0
        }

        this.#list.push(entry);
    }

    removeEntry(index: number): void {
        if (index < 0 || index >= this.#list.length) throw new Error(`removeEntry() was given an index that was out of bounds`);
        this.#list.splice(index, 1);
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

    static allClips(url: string): { [key in EntryMode]: string | null } {
        const clips: { [key in EntryMode]: string | null } = {
            domain: null,
            fullDomain: null,
            url: null,
            exact: null
        };

        for (const mode of Object.keys(clips) as EntryMode[]) {
            clips[mode] = EntryController.clipURL(mode, url);
        }

        return clips;
    }

}