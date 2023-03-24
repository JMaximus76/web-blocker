import { writable } from "svelte/store";
import ItemServer, { type RuntimeSettings } from "../itemServer";
import { buildList, type List } from "../listComponets";
import ListServer from "../listServer";




type Storage = {
    ready: boolean;
    runtimeSettings: RuntimeSettings;
    lists: Record<string, List>;
}


export const storageStore = createStorageStore()

function createStorageStore() {

    async function init() {
        await listServer.sync();
        const infos = await listServer.request("info", {});

        for (const info of infos) {
            const entrys = await listServer.getId("entrys", info.id);
            const timer = await listServer.getId("timer", info.id);
            storage.lists[info.id] = buildList(info, entrys, timer);
        }
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
            mode: "block"
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

        addList(details?: Parameters<ListServer["registerList"]>[0]) {
            const id = listServer.registerList(details);
            listServer.biuldListFromStorage(id).then((list) => {
                storage.lists[id] = list;
                store.set(storage);
            });
        },

        deleteList(id: string) {
            listServer.deleteList(id);
            delete storage.lists[id];
            store.set(storage);
        }
    }


}


