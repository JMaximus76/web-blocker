

const blockedPageURL = browser.runtime.getURL("blocked_page/blocked.html");

function chageToBlockPage(tabId, loadReplace) {
    return browser.tabs.update(tabId, { "url": blockedPageURL, "loadReplace": loadReplace });
}

function handelError(error) {
    console.error(error);
}



browser.webNavigation.onBeforeNavigate.addListener((navigate) => {

    function checkBlocking(item) {
        const blockList = item.blockList;
        const url = new URL(navigate.url);

        for (const key in blockList) {
            const listURL = new URL(blockList[key].url);
            if (listURL.hostname === url.hostname && navigate.frameId === 0) {
                return chageToBlockPage;
            } 
        }
    }  

    function doBlocking(blockFunction) {
        if(blockFunction === undefined) return;

        browser.tabs.query({ active: true, currentWindow: true })
            .then((tabs) => tabs[0].id !== navigate.tabId)
            .then((loadReplace) => blockFunction(navigate.tabId, loadReplace))
            .catch(handelError);
    }




    browser.storage.local.get("blockList")
        .then(checkBlocking)
        .then(doBlocking)
        .catch(handelError);
});








//This checks whether goesBackAfterBlock is true and then goes back if it is


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

    browser.storage.local.get("goesBackAfterBlock")
        .then((item) => item.goesBackAfterBlock)
        .then(goBack)
        .catch(handelError);
}, filter);



