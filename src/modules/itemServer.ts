import type { Mode } from "./listComponets";
import Storage from "./storage";
import type { Subscriber } from "svelte/store";
import browser from "webextension-polyfill";




type RuntimeSettings = {
    isActive: boolean;
    mode: Mode;
}

type ActiveTimers = string[];


type StorageMap = {
    runtimeSettings: RuntimeSettings;
    activeTimers: ActiveTimers;
}


export default class ItemServer {


    static async init() {
        await browser.storage.local.set({runtimeSettings: {isActive: true, mode: "block"}});
        await browser.storage.local.set({activeTimers: []});
    }

    #storage = new Storage();
    #svelte: Subscriber<ItemServer> | null = null;


    async get<T extends keyof StorageMap>(key: T): Promise<StorageMap[T]> {
        const item = await this.#storage.get<StorageMap[T]>(key);
        if (item[0] === undefined) throw new Error(`ItemServer: got undefined when getting ${key}`);
        if (this.#svelte === null) return item[0];
        return this.#svelteProxy(item[0], this, this.#svelte);
    }

    startListening(set: Subscriber<ItemServer>) {
        this.#svelte = set;
        return this.#storage.startListening();
    }


    #svelteProxy<T extends StorageMap[keyof StorageMap]>(obj: T, ref: ItemServer, set: Subscriber<ItemServer>) {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                set(ref);
                return true;
            }
        });
    }

    
}

