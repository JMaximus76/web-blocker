function handelError(error) {console.error(error);}


browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    const url = new URL(navigate.url);


    function checkBlocking(item) {
        const blockList = item.blockList;

        for (const key in blockList) {
            const listURL = new URL(blockList[key].url);

            return listURL.hostname === url.hostname && navigate.frameId === 0;
        }
    }  

  

    function handleBlocking(canBlock) {
        if (canBlock) {
            console.log("-------------------- NEW BLOCKING EVENT --------------------");
            const blockedPage = browser.runtime.getURL("blocked_page/blocked.html");
            browser.tabs.update(navigate.tabId, { "url": blockedPage, "loadReplace": false }).catch(handelError);
        }
    }



    browser.storage.local.get("blockList")
        .then(checkBlocking)
        .then(handleBlocking)
        .catch((error) => console.log(error));
});















//saving this in case I need something from it
//DOES NOT WORK CORRECTLY

// function handleBlocking(canBlock) {
//     if (canBlock) {
//         console.log("-------------------- NEW BLOCKING EVENT --------------------");


//         browser.tabs.get(navigate.tabId)
//             .then((tab) => {


//                 browser.storage.local.get("settings")
//                     .then((item) => {
//                         const blockedPage = browser.runtime.getURL("blocked_page/blocked.html");

//                         if (item.settings.goesBackAfterBlock) {
//                             if (tab.url === "about:blank" || tab.url === "about:newtab") {
//                                 return browser.tabs.update(navigate.tabId, { "url": blockedPage, "loadReplace": true });
//                             }
//                             else {
//                                 return browser.tabs.update(navigate.tabId, { "url": tab.url, "loadReplace": false });
//                             }
//                         }
//                         else {
//                             return browser.tabs.update(navigate.tabId, { "url": blockedPage, "loadReplace": true });
//                         }


//                     })
//                     .catch((error) => console.error(error));
//             })
//             .then(() => console.log("successfully updated tab"))
//             .catch((error) => console.error(error));
//     }
// }












