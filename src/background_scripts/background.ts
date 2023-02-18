import browser from 'webextension-polyfill';
import type { InfoList, Blocklist, Allowlist, Settings } from '../modules/types';
import { setStorageItem, getStorageItem, getCurrentLists } from "../modules/storage";


const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");

function handelError(error: string) {
    console.error(error);
}

function clipURL(url: string) {
    return /^[^?#]*/.exec(url)![0];
}




browser.runtime.onInstalled.addListener(() => {

    const settings: Settings = {
        isActive: true
        
    };

    const blocklist: Blocklist = {
        info: {
            mode: "blocklist",
            name: "Blocklist"
        },
        list: [
            { domain: "youtube.com" },
            { domain: "netflix.com" },
            { url: "https://commons.wikimedia.org/wiki/Main_Page" }
        ]
    };


    const allowlist: Allowlist = {
        info: {
            mode: "allowlist",
            name: "Allowlist"
        },
        list: [
            { domain: "freecodecamp.org" },
            { domain: "learncpp.com" },
            { domain: "google.com" }
        ]
    };

    const infoList: InfoList = {
        current: [blocklist.info],
        all: {
            blocklist: [blocklist.info],
            allowlist: [allowlist.info]
        }
    }
    


    // browser.storage.local.set({
    //         "settings" : settings,
    //         [blocklist.info.name] : blocklist,
    //         [allowlist.info.name] : allowlist
    //     })
    //     .catch(handelError);

    
    setStorageItem({name: "settings", item: settings})
        .then(() => setStorageItem({name: "infoList", item: infoList}))
        .then(() => browser.storage.local.set({[blocklist.info.name]: blocklist}))
        .then(() => browser.storage.local.set({[allowlist.info.name]: allowlist}))
        .catch(handelError);


    
});







function checkAgainstLists(lists: (Blocklist | Allowlist)[], url: string): boolean {
    const clipedURL = clipURL(url);


    for (const blockingList of lists) {

        const printInfo: string = `\n\tname: ${blockingList.info.name}\n\tmode: ${blockingList.info.mode}\n`;

        for(const entry of blockingList.list){
            if ((entry.domain ? clipedURL.includes(entry.domain) : url === entry.url)) {
                console.log(`found match on${printInfo}with ${entry.domain ? entry.domain : entry.url} on ${url}`);

                return blockingList.info.mode === "blocklist"; 
            }
            // else if (blockingList.info.mode === "allowlist") {
            //     return true;
            // }
        }
        console.log(`didn't find a match on${printInfo}for ${url}`);
    }

    return lists[0].info.mode === "allowlist";
}




async function blockPage(tabId: number, blockedURL: string): Promise<browser.Tabs.Tab> {
    console.log(`--------- BLOCKING a page with a url of ${blockedURL}`);
    return browser.tabs.update(tabId, { url: blockedPageURL + `?url=${blockedURL}` });

}




browser.webNavigation.onBeforeNavigate.addListener(async (navigate) => {

    if (navigate.frameId !== 0)                return Promise.resolve();
    if (navigate.url.includes("about:"))       return Promise.resolve();
    if (navigate.url.includes("chrome"))      return Promise.resolve();
    if (navigate.url.includes(blockedPageURL)) return Promise.resolve();
    console.log(`navigating to ${navigate.url}`);

    const settings = await getStorageItem("settings");
    if (!settings.isActive) return;

    
    const lists = await getCurrentLists();
    const doBlocking = checkAgainstLists(lists, navigate.url);

    if (!doBlocking) return;

    await blockPage(navigate.tabId, navigate.url);


    
});



