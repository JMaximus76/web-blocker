import { readable, writable } from "svelte/store";
import browser from "webextension-polyfill";
import { filterBlockPage, type Data, type Id, type Message, formatTime } from "../modules/util";
import type TimerWrapper from "../modules/wrappers/timerWrapper";





export const currentTabFaviconStore = readable("", function start(set) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => { if (tabs[0].favIconUrl) set(tabs[0].favIconUrl) })
        .catch((e) => console.error(new Error(e)));
});



export const currentUrlStore = readable("", function start(set) {

    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
            if (tabs[0].url !== undefined) {
                set(filterBlockPage(tabs[0].url));
            }
        }).catch((e) => console.error(new Error(e)));
});




type TimerRecord = {
    [key: string]: {
        active: boolean;
        timeLeft: number;
        max: number;
    };
};



export type timerDisplayMode = "total" | "remaining";

export const timerStore = createTimerStore();

function createTimerStore() {

    const timerRecord: TimerRecord = {};

    const timerView = {
        get: (id: string, format: timerDisplayMode): string => {
            const timer = timerRecord[id];
            if (timer === undefined) {
                return "0:00"
            } else {
                if (format === "total") {
                    return formatTime(timer.max - timer.timeLeft);
                } else {
                    return formatTime(timer.timeLeft)
                }
            }
        },
    }

    const store = writable(timerView, function start(set) {


        function onMessage(message: Message) {
            if (message.target === "timerStore") {

                if (message.id as Id<"timerStore"> === "start") {
                    const timerId = message.data as Data<"timerStore", "start">;
                    if (timerRecord[timerId] === undefined) return; // we dont care about timers that are not in the store
                    timerRecord[timerId].active = true;
                } else {
                    const timerId = message.data as Data<"timerStore", "stop">;
                    if (timerRecord[timerId] === undefined) return;
                    timerRecord[timerId].active = false;
                }
                set(timerView);
            }
        }

        browser.runtime.onMessage.addListener(onMessage);


        const interval = setInterval(() => {
            let doSet = false;

            for (const entry of Object.values(timerRecord)) {
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
        setTimer: ({id, active, timeLeft, max}: TimerWrapper) => {
            timerRecord[id] = {
                active: active,
                timeLeft: timeLeft,
                max: max
            };
            store.set(timerView);
        }
    };
}