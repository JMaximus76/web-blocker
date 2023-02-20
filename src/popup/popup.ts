import type { InfoList } from "../modules/types";
import {getStorageItem, getActiveInfos, togleActiveMode} from "../modules/storage"





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
