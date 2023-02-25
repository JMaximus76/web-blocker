import { readable } from "svelte/store";
import browser from "webextension-polyfill";
import { generateBlankInfoList, generateDefaultSettings, getStorageItem } from "./storage";




export const infoListStore = readable(generateBlankInfoList(), function start(set) {
    console.log("infoListStore just started");
    getStorageItem("infoList")
        .then((infoList) => set(infoList))
        .catch((error) => console.error(error));

    const onUpdate = (changes: Record<string, any>) => {
        if (changes.infoList) set(changes.infoList.newValue);
    };

    browser.storage.onChanged.addListener(onUpdate);

    return function stop() {
        browser.runtime.onMessage.removeListener(onUpdate);
    };
});



export const settingsStore = readable(generateDefaultSettings(), function start(set) {
    getStorageItem("settings")
        .then((settings) => set(settings))
        .catch((error) => console.error(error));

    const onUpdate = (changes: Record<string, any>) => {
        if (changes.settings) set(changes.settings.newValue);
    };

    browser.storage.onChanged.addListener(onUpdate);

    return function stop() {
        browser.runtime.onMessage.removeListener(onUpdate);
    }
});



