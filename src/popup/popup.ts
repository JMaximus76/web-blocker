import type { InfoList } from "../modules/types";
import {getStorageItem, getActiveInfos, togleActiveMode} from "../modules/storage"



// <div id="popup-content">
//     <button id="blockingMode" type="button">Togle Blocking Mode</button>
//     <p>currently in</p>
//     <p id="indicator"></p>
// </div>

function handelError(error: string) { console.error(error); }



async function buttonClickHandler(): Promise<void> {
    await togleActiveMode();
    await updateIndicator();
}




async function updateIndicator(): Promise<void> {
    const infoList: InfoList = await getStorageItem("infoList");
    const indicator = document.getElementById("indicator");
    if (indicator === null) throw new Error("indicator is null");
    const activeInfos = getActiveInfos(infoList);
    indicator.innerHTML = activeInfos[0].name;
}


updateIndicator()
    .then(() => document.addEventListener("click", buttonClickHandler))
    .catch(handelError);
