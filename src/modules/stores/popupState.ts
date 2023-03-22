import { writable } from "svelte/store";
import type { Info } from "../listComponets";






type Page = "main" | "deactivated" | "list";

type PopupPage = {
    page: Page | "blank";
    infoId: string | null;
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
        infoId: null,
        in: 0,
        out: 0,
    };


    function goto(to: Page): void {
        if (popupPage.page === "list") popupPage.infoId = null;

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



    return {
        subscribe: store.subscribe,




        main(): void {
            goto("main");
        },

        deactivated(): void {
            goto("deactivated");
        },

        list(infoId: string) {
            popupPage.infoId = infoId;
            goto("list");
        }



    }

}



type AddEntryPopupState = {
    active: boolean;
    info: Info | null;
}

export const addEntryPopupStore = createAddEntryPopupStore();

function createAddEntryPopupStore() {

    const state: AddEntryPopupState = {
        active: false,
        info: null,
    }

    const store = writable(state);

    return {
        subscribe: store.subscribe,
        open: (info: Info) => {
            state.active = true;
            state.info = info;
            store.set(state);
        },

        close: () => {
            state.active = false;
            store.set(state);
        },

    }
}