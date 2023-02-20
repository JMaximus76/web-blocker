import browser from 'webextension-polyfill';
import type { Blocklist, Allowlist } from '../modules/types';
import { getStorageItem, registerNewList, updateInfo, initStorageItems, getActiveLists } from "../modules/storage";


const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");

function handelError(error: string) {
    console.error(error);
}

function clipURL(url: string) {
    return /^[^?#]*/.exec(url)![0];
}




browser.runtime.onInstalled.addListener(() => {


    const blocklist: Blocklist = {
        info: {
            mode: "block",
            name: "Blocklist"
        },
        entrys: [
            { domain: "youtube.com" },
            { domain: "netflix.com" },
            { url: "https://commons.wikimedia.org/wiki/Main_Page" }
        ]
    };


    const allowlist: Allowlist = {
        info: {
            mode: "allow",
            name: "Allowlist"
        },
        entrys: [
            { domain: "freecodecamp.org" },
            { domain: "learncpp.com" },
            { domain: "google.com" }
        ]
    };


    


    initStorageItems()
        .then(() => registerNewList(blocklist))
        .then(() => registerNewList(allowlist))
        .then(() => updateInfo(blocklist.info, {active: true}))
        .then(() => updateInfo(allowlist.info, {active: true}))
        .catch(handelError);    
});







function checkAgainstLists(lists: Blocklist[] | Allowlist[], url: string): boolean {
    const clipedURL = clipURL(url);


    for (const blockingList of lists) {

        const printInfo: string = `\n\tname: ${blockingList.info.name}\n\tmode: ${blockingList.info.mode}\n`;

        for(const entry of blockingList.entrys){
            if ((entry.domain ? clipedURL.includes(entry.domain) : url === entry.url)) {
                console.log(`found match on${printInfo}with ${entry.domain ? entry.domain : entry.url} on ${url}`);

                return blockingList.info.mode === "block"; 
            }
        }
        console.log(`didn't find a match on${printInfo}for ${url}`);
    }

    return lists[0].info.mode === "allow";
}




function blockPage(tabId: number, blockedURL: string) {
    console.log(`--------- BLOCKING a page with a url of ${blockedURL}`);
    return browser.tabs.update(tabId, { url: blockedPageURL + `?url=${blockedURL}` });

}




browser.webNavigation.onBeforeNavigate.addListener(async (navigate) => {

    if (navigate.frameId !== 0)                return;
    if (navigate.url.includes("about:"))       return;
    if (navigate.url.includes("chrome:"))       return;
    if (navigate.url.includes(blockedPageURL)) return;
    console.log(`navigating to ${navigate.url}`);

    const settings = await getStorageItem("settings");
    if (!settings.isActive) return;

    
    const lists = await getActiveLists();


    const doBlocking = checkAgainstLists(lists, navigate.url);
    if (!doBlocking) return;

    await blockPage(navigate.tabId, navigate.url);

});



