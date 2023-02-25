import browser from 'webextension-polyfill';
import type { List } from '../modules/types';
import { getStorageItem, registerNewList, initStorageItems, getActiveLists, generateInfo, handelError, addListEntry, checkWithListEntry } from "../modules/storage";


const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");




browser.runtime.onInstalled.addListener(() => {

    const blockInfo = generateInfo({mode: "block", name: "Blocklist", active: true});
    const allowInfo = generateInfo({mode: "allow", name: "Allowlist", active: true});

    initStorageItems()
        .then(() => registerNewList(blockInfo))
        .then(() => addListEntry(blockInfo, { type: "domain", value: "https://www.youtube.com/" }))
        .then(() => addListEntry(blockInfo, { type: "domain", value: "https://www.netflix.com/" }))
        .then(() => addListEntry(blockInfo, { type: "url", value: "https://commons.wikimedia.org/wiki/Main_Page" }))
        .then(() => registerNewList(allowInfo))
        .then(() => addListEntry(allowInfo, { type: "domain", value: "https://www.freecodecamp.org/" }))
        .then(() => addListEntry(allowInfo, { type: "domain", value: "https://www.learncpp.com/" }))
        .then(() => addListEntry(allowInfo, { type: "domain", value: "https://www.google.com/" }))
        .catch(handelError);   
    
});







function checkAgainstLists(lists: List[], url: string): boolean {

    for (const list of lists) {
        for(const entry of list){
            if (checkWithListEntry(entry, url)) {
                return true;
            }
        }
    }
    
    return false;
}




async function blockPage(tabId: number, blockedURL: string): Promise<void> {
    console.log(`BLOCKING a page with a url of ${blockedURL}`);
    await browser.tabs.update(tabId, { url: blockedPageURL + `?url=${blockedURL}` });

}



async function onNavigate(navigate: browser.WebNavigation.OnBeforeNavigateDetailsType): Promise<void> {
    if (navigate.frameId !== 0) return;
    if (navigate.url.includes("about:")) return;
    if (navigate.url.includes("chrome:")) return;
    if (navigate.url.includes(blockedPageURL)) return;

    const settings = await getStorageItem("settings");
    if (!settings.isActive) return;
    console.log(`navigating to ${navigate.url}`);

    const active = await getActiveLists();



    const foundMatch = checkAgainstLists(active.lists, navigate.url);


    const doBlocking = (foundMatch && active.mode === "block") || (!foundMatch && active.mode === "allow");
    if (!doBlocking) return;

    await blockPage(navigate.tabId, navigate.url);
}



browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    onNavigate(navigate).catch(handelError);
});




