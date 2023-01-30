var id = 0;

browser.webNavigation.onBeforeNavigate.addListener((nav) => {
    console.log("------------------------------ NEW onBeforeNavigte EVENT ------------------------------");
    const url = new URL(nav.url);

    function isBlocked(item) {
        const list = item.blockList;


        for(const key in list) {



            console.debug(`mine: ${new URL(list[key].url).hostname}`);
            console.debug(`theres: ${url.hostname}`);
            

            if(new URL(list[key].url).hostname === url.hostname) {
                console.log("THIS SITE IS BOCKED");
                return { cancel: true };
            }
        }
    }


    const blockList = browser.storage.local.get("blockList")
        .then(isBlocked)
        .catch((error) => console.log(error));
    
    
    
    
    

    


});