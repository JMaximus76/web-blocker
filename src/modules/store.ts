import browser from "webextension-polyfill";
import { readable, type Readable } from "svelte/store";
import InfoList from "./infoList";
import Settings from "./settings";





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



