
const blockedPageURL = browser.runtime.getURL("/blocked_page/blocked-page.html");

function handelError(error) {
    console.error(error);
}

function clipURL(url) {
    return /^[^?#]*/.exec(url)[0];
}



browser.runtime.onInstalled.addListener(() => {

    const settings = {
        active: true,
        goesBackAfterBlock: false,
        blockingMode: "blockList",
        useSchedule: false,

        schedule: [
            {
                start: "0:0",
                end: "11:59",
                blockingMode: "blockList"
            },
            {
                start: "12:0",
                end: "19:59",
                blockingMode: "allowList"
            },
            {
                start: "20:0",
                end: "23:59",
                blockingMode: "blockList"
            }
        ]
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


//  TO DO


//  Add schedules



browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    
    
    //if (!active)                               return;
    if (navigate.frameId !== 0)                return;
    if (navigate.url.includes("about:"))       return;
    if (navigate.url.includes(blockedPageURL)) return;
    
    console.log(`navigating to ${navigate.url}`);


    function getBlockingMode() {
        if(!useSchedule) return settings.blockingMode;



    }


    function checkBlocking(item) {
        item = item[settings.blockingMode];
        const clipedURL = clipURL(navigate.url);
        const mode = item.type === "blockList";


        console.table(item);

        for (const entry of item.list) {

            //The turnary operator checks to see if entry.domain is defined, if it is, it checks the url with it,
            //if not, then entry.url must be defined, so it checks with that. 
            if ((entry.domain ? clipedURL.includes(entry.domain) : navigate.url === entry.url)) {
                console.log(`found match with ${entry.domain ? entry.domain : entry.url} on ${navigate.url}`);

                return mode;
            } 
        }

        console.log(`didn't find a match for ${navigate.url}`);
        return !mode;
    }  

    
    function blockPage() {
        console.log(`------------------------------------ BLOCKING a page with a url of ${navigate.url}`);
        return browser.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs) => tabs[0].id !== navigate.tabId)
            .then((loadReplace) => browser.tabs.update(navigate.tabId, { url: blockedPageURL+`?url=${navigate.url}`, loadReplace: loadReplace }));
            
    }

   

      

    let settings;
    browser.storage.local
        .get("settings")
        .then((item) => settings = item.settings)
        .then(getBlockingMode)
        .then((blockingMode) => browser.storage.local.get(blockingMode))
        .then(checkBlocking)
        .then((doBlocking) => { if (doBlocking) return blockPage() })
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



