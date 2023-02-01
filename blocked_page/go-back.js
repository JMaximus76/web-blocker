const item = browser.storage.local.get("settings")
    .then((item) => {
        if(item.settings.goesBackAfterBlock) {
            tabs.getCurrent()
                .then((tab) => browser.tabs.goBack(tab.tabId))
                .catch((error) => console.error(error));
        }
    })
    .catch((error) => console.error(error));

    