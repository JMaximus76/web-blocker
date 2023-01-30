
const blockList = browser.storage.local.get("blockList");
blockList.catch((error) => console.log(error));

console.log(blockList);




browser.webNavigation.onBeforeNavigate.addListener((nav) => {
    //console.log("------------------------------ NEW onBeforeNavigte EVENT ------------------------------");
    const url = new URL(nav.url);


    function isBlocked(item) {
        const list = item.blockList;


        for(const key in list) {

            const listURL = new URL(list[key].url);

            //console.debug(`mine: ${listURL.hostname}`);
            //console.debug(`theres: ${url.hostname}`);
            

            if (listURL.hostname === url.hostname && nav.frameId === 0) {
                console.log(`${nav.url}  --  THIS SITE IS BLOCKED`);
                return true;
            }
        }
    }

    const item = browser.storage.local.get("blockList")
        .then(isBlocked)
        .catch((error) => console.log(error));
    

});



