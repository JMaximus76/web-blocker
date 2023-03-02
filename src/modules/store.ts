import browser from "webextension-polyfill";
import { readable, type Readable } from "svelte/store";
import InfoList from "./infoList";





export const infoListStore = createInfoListStore();

function createInfoListStore(): Readable<InfoList> {
    const infoList = new InfoList();

    return readable(infoList, function start(set) {

        infoList.syncFromStorage().then(() => set(infoList)).catch((error) => console.error(error));

        const onMessage = (message: any) => {
            infoList.receiveUpdate(message);
            set(infoList);
        };
        browser.runtime.onMessage.addListener(onMessage);

        return function stop() {
            browser.runtime.onMessage.removeListener(onMessage);
        }
    });
}






// NEED TO ADD BUT NOT NOW

// export const settingsStore = readable(generateDefaultSettings(), function start(set) {
//     getStorageItem("settings")
//         .then((settings) => set(settings))
//         .catch((error) => console.error(error));

//     const onUpdate = (changes: Record<string, any>) => {
//         if (changes.settings) set(changes.settings.newValue);
//     };

//     browser.storage.onChanged.addListener(onUpdate);

//     return function stop() {
//         browser.runtime.onMessage.removeListener(onUpdate);
//     }
// });




export const currentUrlStore = readable("", function start(set) {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => { if (tabs[0].url) set(tabs[0].url) })
        .catch((error) => console.error(error));

    const onUpdate = (_tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType) => {
        if (changeInfo.url) set(changeInfo.url);
    };

    const onActivated = (activeInfo: browser.Tabs.OnActivatedActiveInfoType) => {
        browser.tabs.get(activeInfo.tabId)
            .then((tab: browser.Tabs.Tab) => {
                if (tab.url) set(tab.url);
            })
            .catch((error) => console.error(error));
    };

    browser.tabs.onUpdated.addListener(onUpdate);
    browser.tabs.onActivated.addListener(onActivated);

    return function stop() {
        browser.tabs.onUpdated.removeListener(onUpdate);
        browser.tabs.onActivated.removeListener(onActivated);
    };
});



