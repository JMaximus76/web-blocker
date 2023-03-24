import type { Mode } from "./listComponets";
import Storage from "./storage";

import browser from "webextension-polyfill";




export type RuntimeSettings = {
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

    startListening() {
        // shoudl make this local to the calss not in storage
        return this.#storage.startListening();
    }


    async get<T extends keyof StorageMap>(key: T): Promise<StorageMap[T]> {
        const item = await this.#storage.getKey<StorageMap[T]>(key);
        if (item === undefined) throw new Error(`ItemServer: got undefined when getting ${key}`);
        return item;
        
    }

}

