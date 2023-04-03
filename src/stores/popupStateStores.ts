import { writable } from "svelte/store";
import ItemServer from "../modules/itemServer";
import type { List } from "../modules/listComponets";






type Page = "main" | "deactivated" | "list";

type PopupPage = {
    page: Page | "blank";
    list: List | null;
    in: number;
    out: number;
}

export const popupPage = createPopupPageStore();

function createPopupPageStore() {
    const index = {
        deactivated: -1,
        main: 0,
        list: 1,
    };

    const popupPage: PopupPage = {
        page: "blank",
        list: null,
        in: 0,
        out: 0,
    };

    

    function goto(to: Page): void {
        if (popupPage.page === "list") popupPage.list = null;

        if (popupPage.page === "blank") {
            popupPage.in = 0;
            popupPage.out = 0;
        } else if (index[to] < index[popupPage.page]) {
            popupPage.out = 300;
            popupPage.in = -300;
        } else {
            popupPage.out = -300;
            popupPage.in = 300;
        }
        popupPage.page = to;
        store.set(popupPage);
    }

    const store = writable(popupPage);


    const itemServer = new ItemServer();
    itemServer.get("runtimeSettings").then((rts) => {
        if (rts.isActive) {
            goto("main")
        } else {
            goto("deactivated");
        }
    });


    return {
        subscribe: store.subscribe,

        main(): void {
            goto("main");
        },

        deactivated(): void {
            goto("deactivated");
        },

        list(list: List) {
            popupPage.list = list;
            goto("list");
        }

    }
}



type Dropdowns = "addEntry" | "confirm" | "blank";

type DropdownState = {
    state: Dropdowns;
    list: List | null;
    confirm: {
        callback: () => void;
        text: string;
    } | null;
}


export const dropdown = createDropdownStore();

function createDropdownStore() {
    const state: DropdownState = {
        state: "blank",
        list: null,
        confirm: null,
    }

    const store = writable(state);

    return {
        subscribe: store.subscribe,

        async addEntry(list: List) {
            state.state = "addEntry";
            state.list = list;
            store.set(state);
            
            while (state.state === "addEntry") {
                await new Promise((resolve) => setTimeout(resolve, 40));
            }
        },

        confirm(callback: () => void, text: string) {
            state.state = "confirm";
            state.confirm = {callback, text};
            store.set(state);
        },

        close() {
            state.state = "blank";
            store.set(state);
        }
    }
}

