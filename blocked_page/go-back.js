const item = browser.storage.local.get("settings")
    .then((item) => {
        if(item.settings.goesBackAfterBlock) {
            browser.tabs.getCurrent()
                .then((tab) => {console.log(tab.tabID); return browser.tabs.goBack(tab.tabId);})
                .catch((error) => console.error(error));
        }
    })
    .catch((error) => console.error(error));

    