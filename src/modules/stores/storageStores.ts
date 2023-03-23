import { writable, type Readable } from "svelte/store";
import ItemServer, { type RuntimeSettings } from "../itemServer";
import { buildList, type List } from "../listComponets";
import ListServer, { type ListEdit } from "../listServer";




type Storage = {
    ready: boolean;
    runtimeSettings: RuntimeSettings;
    lists: Record<string, List>;
}


export const storageStore = createStorageStore()

function createStorageStore(): Readable<Storage> {

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

    return writable(storage, function start(set) {
        
        // const doSet = () => {
        //     //set(storage);
        // };

        const listEdit: ListEdit = {
            add: (id: string, list: Promise<List>) => {
                list.then((l) => storage.lists[id] = l);

            },

            delete: (id: string) => {
                delete storage.lists[id];

            },
        };

        // const itemEdit: ItemEdit = {
        //     modify: doSet,
        // };

        

        const stopListeningList = listServer.startListening(listEdit);
        const stopListeningItem = itemServer.startListening();





        init().then(() => set(storage)).catch((e) => console.error(e));
        
        return function stop() {
            stopListeningList();
            stopListeningItem();
        }

    });


}




// export const listStore = createListStore();

// function createListStore(): Readable<ListServer> {

//     const server = new ListServer();
//     server.sync().catch(handelError);

//     return readable(server, function start(set) {
//         const stopListening = server.startListening(set);

//         return function stop() {
//             stopListening();
//         }
//     });
// }




// export const itemStore = createItemStore();

// function createItemStore(): Readable<ItemServer> {

//     const server = new ItemServer();

//     return readable(server, function start(set) {
//         const stopListening = server.startListening(set);

//         return function stop() {
//             stopListening();
//         }
//     });
// }
