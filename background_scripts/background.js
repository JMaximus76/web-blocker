
const blockedPageURL = browser.runtime.getURL("/blocked_page/blocked-page.html");

function handelError(error) {
    console.error(error);
}

function clipURL(url) {
    return /^[^?#]*/.exec(url)[0];
}



browser.runtime.onInstalled.addListener(() => {

    const settings = {
        isActive: true,
        goesBackAfterBlock: true,
        blockingMode: "blockList",
    };

    const blockList = {
        type: "blockList",
        list: [
            { domain: "youtube.com" },
            { domain: "netflix.com" },
            { url: "https://commons.wikimedia.org/wiki/Main_Page" }
        ]
    };


    const allowList = {
        type: "allowList",
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
            "allowList": allowList
        })
        .catch(handelError);
});





browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    
    
    
    if (navigate.frameId !== 0)                return;
    if (navigate.url.includes("about:"))       return;
    if (navigate.url.includes(blockedPageURL)) return;
    
    console.log(`navigating to ${navigate.url}`);


    function checkActive(storageItem) {
        if (storageItem.settings.isActive) {
            return browser.storage.local
                .get(storageItem.settings.blockingMode)
                .then(checkBlocking)
                .then((doBlocking) => { if (doBlocking) return blockPage() });
        }
    }


    function checkBlocking(storageItem) {
        const blockingList = Object.values(storageItem)[0];
        const clipedURL = clipURL(navigate.url);

        for (const entry of blockingList.list) {
            if ((entry.domain ? clipedURL.includes(entry.domain) : navigate.url === entry.url)) {
                console.log(`found ${blockingList.type} match with ${entry.domain ? entry.domain : entry.url} on ${navigate.url}`);

                return blockingList.type === "blockList";
            } 
        }

        console.log(`didn't find a match for ${navigate.url}`);
        return blockingList.type === "allowList";
    }  

    
    function blockPage() {
        console.log(`--------- BLOCKING a page with a url of ${navigate.url}`);
        return browser.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs) => tabs[0].id !== navigate.tabId)  //This is so that if the user wants to go 
            .then((loadReplace) => browser.tabs.update(navigate.tabId, { url: blockedPageURL+`?url=${navigate.url}`, loadReplace: loadReplace }))
            
    }

   

    browser.storage.local
        .get("settings")
        .then(checkActive)
        .catch(handelError)
});











const filter = {
    urls: [blockedPageURL],
    properties: ["url"]
};

browser.tabs.onUpdated.addListener((tabId) => {


    function goBack(doesGoBack) {
        if(doesGoBack) {
            return browser.tabs.goBack(tabId);
        }
    }

    browser.storage.local.get("settings")
        .then((item) => item.settings.goesBackAfterBlock)
        .then(goBack)
        .catch(handelError);
}, filter);



