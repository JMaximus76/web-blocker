
const blockedPageURL = browser.runtime.getURL("/blocked_page/index.html");

function handelError(error) {
    console.error(error);
}



browser.runtime.onInstalled.addListener(() => {

    const settings = {
        goesBackAfterBlock: true,
        blockingMode: "blockList"
    };

    const blockList = {
        type: "blockList",
        list: [
            { url: "https://www.youtube.com" },
            { url: "https://www.netflix.com" }
        ]
    };


    const allowList = {
        type: "allowList",
        list: [
            { url: "https://www.freecodecamp.org" },
            { url: "https://www.learncpp.com" },
            { url: "https://www.google.com" }
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

    function getList() {
        return browser.storage.local.get(settings.blockingMode);   
    }

    function checkBlocking(item) {
        item = item[settings.blockingMode];
        const url = new URL(navigate.url);

        //item.type can either be "blockList" or "allowList"
        const mode = item.type === "blockList";

        for (const i of item.list) {

            const listURL = new URL(i.url);

            if (listURL.hostname === url.hostname && navigate.frameId === 0) {
                return mode;
            } 
        }
        return !mode;
    }  

    
    function blockPage() {
        console.log(`trying to block an page of url ${navigate.url}`);
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
        .then(getList)
        .then(checkBlocking)
        .then((doBlocking) => { if(doBlocking) return blockPage() })
        .catch(handelError)
});











const filter = {
    urls: [blockedPageURL],
    properties: ["url"]
};



browser.tabs.onUpdated.addListener((tabId) => {

    console.log("tab was updated");

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



