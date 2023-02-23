import { readable } from "svelte/store";
import browser from "webextension-polyfill";


export const infoList =  readable(null, function start(set) {
    const infoList = browser.storage.local.get("infoList");
    infoList.then((value) => set(Object.values(value)[0]));
    infoList.catch((error) => console.error(error));

    const onMessage = (message: {type: string, item: any}) => {
        if (message.type === "infoList") {
            set(message.item);
        }
    };

    browser.runtime.onMessage.addListener(onMessage);

    return function stop() {
        browser.runtime.onMessage.removeListener(onMessage);
    };
});



export const settings = readable(null, function start(set) {
    const settings = browser.storage.local.get("settings");
    settings.then((value) => set(Object.values(value)[0]));
    settings.catch((error) => console.error(error));

    const onMessage = (message: {type: string, item: any}) => {
        if (message.type === "settings") {
            set(message.item);
        }
    };

    browser.runtime.onMessage.addListener(onMessage);

    return function stop() {
        browser.runtime.onMessage.removeListener(onMessage);
    }
});


export const lists = readable(null, function start(set) {
    




    return function stop() {

    }
});
