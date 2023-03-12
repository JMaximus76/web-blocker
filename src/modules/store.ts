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

function formatTime(time: number): string {
    if (time < 1000) return "00:00";
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;

    const h = Math.trunc(time / hour);
    const m = Math.trunc((time - h * hour) / minute);
    const s = Math.trunc((time - h * hour - m * minute) / second);



    if (h === 0) return `${(m < 10 ? "0" : "") + m}:${(s < 10 ? "0" : "") + s}`;
    return `${(h < 10 ? "0" : "") + h}:${(m < 10 ? "0" : "") + m}:${(s < 10 ? "0" : "") + s}`;
}



export const timerDisplayStore = createTimerDisplayStore();

function createTimerDisplayStore() {

    console.log("making new timerDisplayStore");

    const timerDisplay = createTimerDisplay();


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
                console.log("tiemrstore message", message);
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



export const currentUrlStore = readable("", function start(set) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => { if (tabs[0].url) set(filterBlockPage(tabs[0].url)) })
        .catch((e) => console.error(new Error(e)));


    const filterBlockPage = (url: string) => {
        if (url.includes(browser.runtime.getURL("/src/blocked_page/blocked-page.html"))) {
            const regexArray = /(?<=\?url=).*/.exec(url);
            if (regexArray === null) throw new Error(`Getting url from "Blocked Page" resulted in null`);
            url = regexArray[0];
        }
        return url;
    }

    const onUpdate = (_tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType) => {
        
        if (changeInfo.url) {
            console.log("filter ", filterBlockPage(changeInfo.url));
            set(filterBlockPage(changeInfo.url));
        }
    };

    const onActivated = (activeInfo: browser.Tabs.OnActivatedActiveInfoType) => {
        browser.tabs.get(activeInfo.tabId)
            .then((tab: browser.Tabs.Tab) => {
                if (tab.url) {
                    console.log("filter ", filterBlockPage(tab.url));
                    set(filterBlockPage(tab.url));
                }
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



