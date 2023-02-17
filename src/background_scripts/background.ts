import browser from 'webextension-polyfill';
import * as Types from '../types';

const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");

function handelError(error: string) {
    console.error(error);
}

function clipURL(url: string) {
    return /^[^?#]*/.exec(url)![0];
}




browser.runtime.onInstalled.addListener(async () => {

    const settings: Types.Settings = {
        isActive: true
        
    };

    const currentListName: string = "blockList";

    const blockList: Types.BlockingList = {
        mode: "blockList",
        list: [
            { domain: "youtube.com" },
            { domain: "netflix.com" },
            { url: "https://commons.wikimedia.org/wiki/Main_Page" }
        ]
    };


    const allowList = {
        mode: "allowList",
        list: [
            { domain: "freecodecamp.org" },
            { domain: "learncpp.com" },
            { domain: "google.com" }
        ]
    };


    browser.storage.local
        .set({
            "settings": settings,
            "blockList": blockList,
            "allowList": allowList,
            "currentListName": currentListName
        })
        .catch(handelError);
});







function matchAgainstList(blockingList: Types.BlockingList, url: string) {
    const clipedURL = clipURL(url);

    for (const entry of blockingList.list) {
        if ((entry.domain ? clipedURL.includes(entry.domain) : url === entry.url)) {
            console.log(`found ${blockingList.mode} match with ${entry.domain ? entry.domain : entry.url} on ${url}`);

            return blockingList.mode === "blockList"; 
        }
    }

    console.log(`didn't find a match for ${url}`);
    return blockingList.mode === "allowList";
}


async function getCurrentList() {
    const listName: Record<string, any> = await browser.storage.local
    .get("currentListName")
    .then((listName: Record<string, any>) => browser.storage.local.get(listName));

    const list = await browser.storage.local.get(listName)
}


function blockPage(tabId: number, blockedURL: string) {
    console.log(`--------- BLOCKING a page with a url of ${blockedURL}`);
    return browser.tabs.update(tabId, { url: blockedPageURL + `?url=${blockedURL}` });

}





browser.webNavigation.onBeforeNavigate.addListener((navigate) => {

    if (navigate.frameId !== 0)                return;
    if (navigate.url.includes("about:"))       return;
    if (navigate.url.includes(blockedPageURL)) return;
    
    console.log(`navigating to ${navigate.url}`);




    function checkActive(storageItem: Record<string, Types.Settings>) {
        if (storageItem.settings.isActive) {
            return browser.storage.local
                .get(storageItem.settings.blockingMode)
                .then(checkBlocking)
                .then((doBlocking) => { if (doBlocking) return blockPage() });
        }
    }


    //const blockingList = Object.values(storageItem)[0];

      

    
    

   

    browser.storage.local
        .get("settings")
        .then(checkActive)
        .catch(handelError)
});



