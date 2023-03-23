import { writable } from "svelte/store";
import ItemServer from "../itemServer";
import type { List } from "../listComponets";






type Page = "main" | "deactivated" | "list";

type PopupPage = {
    page: Page | "blank";
    list: List | null;
    in: number;
    out: number;
}

export const popupPageStore = createPopupPageStore();

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



type AddEntryPopupState = {
    active: boolean;
    list: List | null;
}

export const addEntryPopupStore = createAddEntryPopupStore();

function createAddEntryPopupStore() {

    const state: AddEntryPopupState = {
        active: false,
        list: null,
    }

    const store = writable(state);

    return {
        subscribe: store.subscribe,
        open: (list: List) => {
            state.active = true;
            state.list = list;
            store.set(state);
        },

        close: () => {
            state.active = false;
            store.set(state);
        },

    }
}