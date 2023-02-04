
const blockedPageURL = browser.runtime.getURL("/blocked_page/index.html");

function handelError(error) {
    console.error(error);
}





browser.runtime.onInstalled.addListener(() => {

    const settings = {
        goesBackAfterBlock: false,
        blockingMode: "blockList"
    };

    const blockList = {
        type: "blockList",
        list: [
            { domain: "youtube.com" },
            { domain: "netflix.com" },
            { domain: "commons.wikimedia.org" }
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

//  Correctly handel urls in the lists and checkBlocking function
//  Add scheduals



browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    

    

    if (navigate.url === blockedPageURL) return;
    if (navigate.url.includes("about:")) return;
    if (navigate.frameId !== 0)          return;

    console.log(`navigating to ${navigate.url}`);

    function getList() {
        return browser.storage.local.get(settings.blockingMode);   
    }

    function checkBlocking(item) {
        item = item[settings.blockingMode];

        const mode = item.type === "blockList";

        for (const entry of item.list) {


            if (navigate.url.includes(entry.domain ? entry.domain : entry.url)) {
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
            .then((loadReplace) => {
                browser.tabs.update(navigate.tabId, { url: blockedPageURL, loadReplace: loadReplace });
            });
    }

   

      

    let settings;
    browser.storage.local
        .get("settings")
        .then((item) => settings =  item.settings)
        .then(() => browser.storage.local.get(settings.blockingMode))
        .then(checkBlocking)
        .then((doBlocking) => { if(doBlocking) return blockPage() })
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



