import browser from 'webextension-polyfill';

import { getStorageItem, registerNewList, initStorageItems, getActiveLists, generateInfo, handelError, addListEntry} from "../modules/storage";
import type { StorageInfo, Timer } from '../modules/types';
import { checkAgainstLists, setTimers } from '../modules/util';


const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");




browser.runtime.onInstalled.addListener(() => {

    const blockInfo = generateInfo({ mode: "block", name: "Blocklist", active: true });
    const allowInfo = generateInfo({ mode: "allow", name: "Allowlist", active: true });


    

    async function test(): Promise<void> {
        for(const info of testArray) {
            await registerNewList(info);
            
            if (info.mode === "block") {
                await addListEntry(info, { type: "domain", value: "https://www.youtube.com/" });
                await addListEntry(info, { type: "domain", value: "https://www.netflix.com/" });
                await addListEntry(info, { type: "url", value: "https://commons.wikimedia.org/wiki/Main_Page" });
            } else {
                await addListEntry(info, { type: "domain", value: "https://www.freecodecamp.org/" });
                await addListEntry(info, { type: "domain", value: "https://www.learncpp.com/" });
                await addListEntry(info, { type: "domain", value: "https://www.google.com/" });
            }
        }
    }


    initStorageItems()
        .then(() => registerNewList(blockInfo))
        .then(() => addListEntry(blockInfo, { type: "domain", value: "https://www.youtube.com/" }))
        .then(() => addListEntry(blockInfo, { type: "domain", value: "https://www.netflix.com/" }))
        .then(() => addListEntry(blockInfo, { type: "url", value: "https://commons.wikimedia.org/wiki/Main_Page" }))
        .then(() => registerNewList(allowInfo))
        .then(() => addListEntry(allowInfo, { type: "domain", value: "https://www.freecodecamp.org/" }))
        .then(() => addListEntry(allowInfo, { type: "domain", value: "https://www.learncpp.com/" }))
        .then(() => addListEntry(allowInfo, { type: "domain", value: "https://www.google.com/" }))
        .then(() => test())
        .catch(handelError);


    
    
});








async function onNavigate(navigate: browser.WebNavigation.OnBeforeNavigateDetailsType): Promise<void> {
    
    const isActive = await getStorageItem("active");
    if (!isActive) return;
    console.log(`navigating to ${navigate.url}`);

    const active = await getActiveLists();



    const foundMatch = checkAgainstLists(active.lists, navigate.url);


    const doBlocking = (foundMatch && active.mode === "block") || (!foundMatch && active.mode === "allow");
    if (!doBlocking) return;

    console.log(`BLOCKING a page with a url of ${navigate.url}`);
    await browser.tabs.update(navigate.tabId, { url: blockedPageURL + `?url=${navigate.url}` });
}



browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    if (navigate.frameId !== 0) return;
    if (navigate.url.includes(blockedPageURL)) return;
    onNavigate(navigate).catch(handelError);
}, { url: [{ urlMatches: "https://*/*" }, { urlMatches: "http://*/*" }] });












browser.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    
    async function timerUpdate(url: string): Promise<void> {
        const active = await getActiveLists();
        if (!active) return;

        await setTimers(url);
    }
    
    
    if (changeInfo.url) {
        timerUpdate(changeInfo.url).catch(handelError);
    }

});






browser.tabs.onActivated.addListener((activeInfo) => {
    async function timerUpdate(): Promise<void> {
        const active = await getActiveLists();
        if (!active) return;
        
        const tab = await browser.tabs.get(activeInfo.tabId);
        if (!tab.url) return;

        await setTimers(tab.url);
    }

    timerUpdate().catch(handelError);
});







browser.alarms.onAlarm.addListener((alarm) => {
    async function timerUpdate(alarm: browser.Alarms.Alarm): Promise<void> {
        const timer: Timer | undefined = (await browser.storage.local.get(alarm.name))[alarm.name];
        if (timer === undefined) {
            console.error(new Error(`Timer ${alarm.name} not found`));
        }

        timer!.total += 1;

        await browser.storage.local.set({ [alarm.name]: timer });
    }
    

    timerUpdate(alarm).catch(handelError);
});






