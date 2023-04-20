import { writable } from "svelte/store";
import ItemServer, { type RuntimeSettings } from "../modules/itemServer";
import { type List } from "../modules/listComponets";
import ListServer from "../modules/listServer";




type Storage = {
    ready: boolean;
    runtimeSettings: RuntimeSettings;
    lists: Record<string, List>;
}


export const storageStore = createStorageStore()

function createStorageStore() {

    async function init() {
        await listServer.sync();
        storage.lists = await listServer.buildAllListsRecord();
        const rts = await itemServer.get("runtimeSettings");
        storage.runtimeSettings = rts;
        storage.ready = true;
    }
    

    const listServer = new ListServer();
    const itemServer = new ItemServer();

    const storage: Storage = {
        ready: false,
        runtimeSettings: {
            isActive: true,
            mode: "block",
            resetTime: 0
        },
        lists: {}
    };

    const store = writable(storage, function start(set) {
        const stopListeningList = listServer.startListening();
        const stopListeningItem = itemServer.startListening();

        init().then(() => set(storage)).catch((e) => console.error(e));
        
        return function stop() {
            stopListeningList();
            stopListeningItem();
        }

    });


    return {
        ...store,

        async addList(details?: Parameters<ListServer["registerList"]>[0]) {
            const id = listServer.registerList(details);

            const list = await listServer.buildListFromStorage(id);
            storage.lists[id] = list;
            store.set(storage);
            return list;
        },

        deleteList(id: string) {
            listServer.deleteList(id);
            delete storage.lists[id];
            store.set(storage);
        }
    }


}


