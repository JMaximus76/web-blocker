browser.runtime.onInstalled.addListener(() => {
    


    const blockList = {
        "youtube": {
            "url": "https://www.youtube.com",
            "blackList": true,
            "whiteList": false
        },

        "freecodecamp": {
            "url": "https://www.freecodecamp.org",
            "blackList": false,
            "whiteList": true
        }
    }



    function onStorage() {
        console.log("blockList was put into storage.local");
    }

    function onError(error) {
        console.log(error);
    }

    console.log("browser.runtime.onInstalled was called");

    browser.storage.local.set({blockList})
        .then(onStorage, onError);

        


});