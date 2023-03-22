import { readable, writable } from "svelte/store";
import browser from "webextension-polyfill";
import type { Timer } from "../listComponets";
import TimerControler from "../timerControler";
import { filterBlockPage, type Data, type Id, type Message } from "../util";





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








type TimerRecord = {
    [key: string]: {
        active: boolean;
        timeLeft: number;
    };
};





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



export const timerStore = createTimerStore();

function createTimerStore() {

    const timerRecord: TimerRecord = {};

    const timerView = {
        get: (id: string) => {
            const data = timerRecord[id];
            if (data === undefined) {
                return "00:00";
            } else {
                return formatTime(data.timeLeft);
            }
        },
    }

    const store = writable(timerView, function start(set) {


        function onMessage(message: Message) {
            if (message.target === "timerStore") {
                if (message.id as Id<"timerStore"> === "start") {
                    const timerId = message.data as Data<"timerStore", "start">;
                    timerRecord[timerId].active = true;
                } else {
                    const timerId = message.data as Data<"timerStore", "stop">;
                    timerRecord[timerId].active = true;
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
        addTimer: (timer: Timer) => {
            const tc = new TimerControler(timer);

            timerRecord[timer.id] = {
                active: tc.active,
                timeLeft: tc.timeLeft,
            };
            store.set(timerView);
        }
    };
}