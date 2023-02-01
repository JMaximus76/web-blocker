browser.runtime.onInstalled.addListener(() => {
    


    const blockList = {
        "youtube": {
            "url": "https://www.youtube.com",
            "whiteList": false
        },

        "freecodecamp": {
            "url": "https://www.freecodecamp.org",
            "whiteList": true
        }
    }

    const goesBackAfterBlock = true;





    

    function onStorage() {
        console.log(`item was put into storage.local`);
    }

    function onError(error) {
        console.log(error);
    }

    console.log("browser.runtime.onInstalled was called");

    browser.storage.local.set({blockList})
        .then(onStorage, onError);

    browser.storage.local.set({ "goesBackAfterBlock": goesBackAfterBlock })
        .then(onStorage, onError);

        


});