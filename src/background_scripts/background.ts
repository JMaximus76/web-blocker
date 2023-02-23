import browser from 'webextension-polyfill';
import type { List, PromiseError } from '../modules/types';
import { getStorageItem, registerNewList, initStorageItems, getActiveLists, generateList } from "../modules/storage";


const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");

function handelError(error: PromiseError) {
    console.error(error.message);
    if (error.details) console.table(error.details);
}

function clipURL(url: string) {
    return /^[^?#]*/.exec(url)![0];
}




browser.runtime.onInstalled.addListener(() => {

    const block = generateList({mode: "block", listId: "Blocklist", active: true});
    block.list = [
        { domain: "youtube.com" },
        { domain: "netflix.com" },
        { url: "https://commons.wikimedia.org/wiki/Main_Page" }
    ];

    const allow = generateList({mode: "allow", listId: "Allowlist", active: true});
    allow.list = [
        { domain: "freecodecamp.org" },
        { domain: "learncpp.com" },
        { domain: "google.com" }
    ];


    initStorageItems()
        .then(() => registerNewList(block))
        .then(() => registerNewList(allow))
        .catch(handelError);   
    
});







function checkAgainstLists(lists: List[], url: string): boolean {
    const clipedURL = clipURL(url);


    for (const list of lists) {
        for(const entry of list){
            if ((entry.domain ? clipedURL.includes(entry.domain) : url === entry.url)) {
                return true;
            }
        }
    }

    return false;
}




function blockPage(tabId: number, blockedURL: string) {
    console.log(`--------- BLOCKING a page with a url of ${blockedURL}`);
    return browser.tabs.update(tabId, { url: blockedPageURL + `?url=${blockedURL}` });

}




browser.webNavigation.onBeforeNavigate.addListener(async (navigate) => {

    if (navigate.frameId !== 0)                return;
    if (navigate.url.includes("about:"))       return;
    if (navigate.url.includes("chrome:"))      return;
    if (navigate.url.includes(blockedPageURL)) return;

    const settings = await getStorageItem("settings");
    if (!settings.isActive) return;
    console.log(`navigating to ${navigate.url}`);
    
    const active = await getActiveLists();


    const foundMatch = checkAgainstLists(active.lists, navigate.url);
    console.log(foundMatch);

    const doBlocking = (foundMatch && active.mode === "block") || (!foundMatch && active.mode === "allow");
    if (!doBlocking) return;

    await blockPage(navigate.tabId, navigate.url);
});




