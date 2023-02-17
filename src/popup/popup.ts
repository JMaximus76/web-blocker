import browser from 'webextension-polyfill';


let settings: any;


function handelError(error: string) { console.error(error); }





function buttonClickHandler(details: any) {
    if (details.target.id === "blockingMode") {
        settings.blockingMode = (settings.blockingMode === "blockList") ? "allowList" : "blockList";

        setBlockingMode()


        browser.storage.local
            .set({"settings": settings})
            .then(() => console.log(`${settings.blockingMode} was just put into local storage`))
            .catch(handelError);
    }
}

function setBlockingMode() {
    const indicator = document.getElementById("indicator");
    if (indicator !== null) {
        indicator.innerHTML = settings.blockingMode;
    }
}




browser.storage.local
    .get("settings")
    .then((item) => settings = item.settings)
    .then(() => setBlockingMode())
    .then(() => document.addEventListener("click", buttonClickHandler))
    .catch(handelError);