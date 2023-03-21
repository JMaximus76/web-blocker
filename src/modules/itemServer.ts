import type { Mode } from "./listComponets";
import Storage from "./storage";
import type { Subscriber } from "svelte/store";




type RuntimeSettings = {
    isActive: boolean;
    mode: Mode;
}

type ActiveTimers = string[];


type storageMap = {
    runtimeSettings: RuntimeSettings;
    activeTimers: ActiveTimers;
}


export default class ItemServer {


    #storage = new Storage();
    #svelte: Subscriber<ItemServer> | null = null;

    async getRuntimeSettings() {
        const item = await this.#storage.get<storageMap["runtimeSettings"]>("runtimeSettings");
        if (item[0] === undefined) throw new Error("ItemServer: got undefined when getting runtimeSettings");
        return item[0];
    }

    
}

