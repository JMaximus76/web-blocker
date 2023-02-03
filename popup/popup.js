
let settings = {};


function handelError(error) { console.error(error); }





function buttonClickHandler(details) {
    if(details.target.id === "blockingMode") {
        settings.blockingMode = (settings.blockingMode === "blockList") ? "allowList" : "blockList";

        document.getElementById("indecator").innerHTML = settings.blockingMode;

        browser.storage.local
            .set({"settings": settings})
            .then(console.log(`${settings.blockingMode} was just put into local storage`))
            .catch(handelError);
    }
}




browser.storage.local
    .get("settings")
    .then((item) => settings = item.settings)
    .then(() => document.getElementById("indecator").innerHTML = settings.blockingMode)
    .then(() => document.addEventListener("click", buttonClickHandler))
    .catch(handelError);