import browser from "webextension-polyfill";
import { readable, writable, type Readable } from "svelte/store";
import InfoList from "./infoList";
import Settings from "./settings";
import type Timer from "./timer";
import type { Message } from "./util";





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


function createTimerDisplay() {
    const display: TimerDisplay = {};
    return display;
}



export const timerDisplayStore = createTimerDisplayStore();

function createTimerDisplayStore() {

    const timerDisplay = createTimerDisplay();

    const store = writable(timerDisplay, function start(set) {
        

        function onMessage(message: Message) {
            console.log("Message received in timerDisplayStore");
            console.table(message);
            if (message.for === "timerStore") {
                timerDisplay[message.id] = message.item;
                set(timerDisplay);
            }
        }

        browser.runtime.onMessage.addListener(onMessage);


        const interval = setInterval(() => {
            console.log("Timer Queue Interval when off");
            for (const entry of Object.values(timerDisplay)) {
                if (entry.active) {
                    entry.timeLeft -= 1000;
                }
            }

            set(timerDisplay);
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
            store.set(timerDisplay);
        }
    };
}



export const currentUrlStore = readable("", function start(set) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => { if (tabs[0].url) set(tabs[0].url) })
        .catch((e) => console.error(new Error(e)));

    const onUpdate = (_tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType) => {
        if (changeInfo.url) set(changeInfo.url);
    };

    const onActivated = (activeInfo: browser.Tabs.OnActivatedActiveInfoType) => {
        browser.tabs.get(activeInfo.tabId)
            .then((tab: browser.Tabs.Tab) => {
                if (tab.url) set(tab.url);
            })
            .catch((e) => console.error(new Error(e)));
    };

    browser.tabs.onUpdated.addListener(onUpdate);
    browser.tabs.onActivated.addListener(onActivated);

    return function stop() {
        browser.tabs.onUpdated.removeListener(onUpdate);
        browser.tabs.onActivated.removeListener(onActivated);
    };
});



