import type { Mode } from "./listComponets";
import Storage from "./storage";

import browser from "webextension-polyfill";
import { conform } from "./util";




export type RuntimeSettings = {
    isActive: boolean;
    mode: Mode;
    resetTime: number;
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
        return this.#storage.startListening();
    }


    async get<T extends keyof StorageMap>(key: T): Promise<StorageMap[T]> {
        const item = await this.#storage.getKey<StorageMap[T]>(key);
        if (item === undefined) throw new Error(`ItemServer: got undefined when getting ${key}`);
        return item;
        
    }




    static validate(storage: Record<string, any>): Record<string, any> {


        const templateRuntimeSettings: RuntimeSettings = {
            isActive: true,
            mode: "block",
            resetTime: Date.now()
        };

        const validItems: Record<string, any> = {};

        if (typeof storage.runtimeSettings === "object" && storage.runtimeSettings !== null) {
            validItems.runtimeSettings = conform(storage.runtimeSettings, templateRuntimeSettings);
        } else {
            validItems.runtimeSettings = templateRuntimeSettings;
        }


        if (Array.isArray(storage.activeTimers)) {
            validItems.activeTimers = storage.activeTimers;
        } else {
            validItems.activeTimers = [];
        }

        return validItems;
        
    }

}

