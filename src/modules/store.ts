import browser from "webextension-polyfill";
import { readable, writable, type Readable } from "svelte/store";
import InfoList from "./infoList";
import Settings from "./settings";
import type Timer from "./timer";
import { filterBlockPage, type Message } from "./util";





export const infoListStore = createInfoListStore();

function createInfoListStore(): Readable<InfoList> {
    
    const infoList = new InfoList();

    return readable(infoList, function start(set) {
        infoList.startListening(set);

        infoList.syncFromStorage().catch((e) => console.error(new Error(e)));

        return function stop() {
            infoList.stopListening();
        }
    });
}




export const settingsStore = createSettingsStore();

function createSettingsStore(): Readable<Settings> {
    const settings = new Settings();

    return readable(settings, function start(set) {
        settings.startListening(set);

        settings.syncFromStorage().catch((e) => console.error(new Error(e)));

        return function stop() {
            settings.stopListening();
        }
    });
}




type TimerDisplay = {
    [key: string]: {
        active: boolean;
        timeLeft: number;
    };
};


export function createTimerDisplayMessage(timer: Timer): Message {
    return {
        for: "timerStore",
        id: timer.id,
        item: {
            active: timer.isActive,
            timeLeft: timer.timeLeft,
        },
    };
}


function formatTime(time: number): string {
    if (time < 1000) return "0:00";
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;

    const h = Math.trunc(time / hour);
    const m = Math.trunc((time - h * hour) / minute);
    const s = Math.trunc((time - h * hour - m * minute) / second);



    if (h === 0 || m === 0) return `${m}:${(s < 10 ? "0" : "") + s}`;
    return `${h}:${(m < 10 ? "0" : "") + m}:${(s < 10 ? "0" : "") + s}`;
}



export const timerDisplayStore = createTimerDisplayStore();

function createTimerDisplayStore() {

    const timerDisplay: TimerDisplay = {};

    const timerView = {
        get: (id: string) => {
            const data = timerDisplay[id];
            if (data === undefined) {
                return "00:00";
            } else {
                return formatTime(data.timeLeft);
            }
        },
    }

    const store = writable(timerView, function start(set) {
        

        function onMessage(message: Message) {
            if (message.for === "timerStore") {
                timerDisplay[message.id].active = message.item.active;
                set(timerView);
            }
        }

        browser.runtime.onMessage.addListener(onMessage);


        const interval = setInterval(() => {
            let doSet = false;

            for (const entry of Object.values(timerDisplay)) {
                if (entry.active) {
                    doSet = true;
                    entry.timeLeft -= 1000;
                }
            }

            if (doSet) set(timerView);
        }, 1000);


        return function stop() {
            clearInterval(interval);
            browser.runtime.onMessage.removeListener(onMessage);
        }
    });


    return {
        subscribe: store.subscribe,
        addTimer: (timer: Timer) => {
            timerDisplay[timer.id] = {
                active: timer.isActive,
                timeLeft: timer.timeLeft,
            };
            store.set(timerView);
        }
    };
}



export const currentTabFaviconStore = readable("", function start(set) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => { if (tabs[0].favIconUrl) set(tabs[0].favIconUrl) })
        .catch((e) => console.error(new Error(e)));
});



export const currentUrlStore = readable("", function start(set) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => { if (tabs[0].url) set(filterBlockPage(tabs[0].url)) })
        .catch((e) => console.error(new Error(e)));
});




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

        if(popupPage.page === "blank") {
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
    infoId: string | null;
}

export const addEntryPopupStore = createAddEntryPopupStore();

function createAddEntryPopupStore() {

    const state: AddEntryPopupState = {
        active: false,
        infoId: null,
    }

    const store = writable(state);

    return {
        subscribe: store.subscribe,
        open: (infoId: string) => {
            state.active = true;
            state.infoId = infoId;
            store.set(state);
        },

        close: () => {
            state.active = false;
            store.set(state);
        },

    }
}


