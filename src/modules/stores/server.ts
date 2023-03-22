import { readable, type Readable } from "svelte/store";
import ItemServer from "../itemServer";
import ListServer from "../listServer";
import { handelError } from "../util";







export const listStore = createListStore();

function createListStore(): Readable<ListServer> {

    const server = new ListServer();
    server.sync().catch(handelError);

    return readable(server, function start(set) {
        const stopListening = server.startListening(set);

        return function stop() {
            stopListening();
        }
    });
}




export const itemStore = createItemStore();

function createItemStore(): Readable<ItemServer> {

    const server = new ItemServer();

    return readable(server, function start(set) {
        const stopListening = server.startListening(set);

        return function stop() {
            stopListening();
        }
    });
}
