import type { InfoList } from "../modules/types";
import {getStorageItem, setStorageItem} from "../modules/storage"





function handelError(error: string) { console.error(error); }



async function buttonClickHandler(): Promise<void> {
    const infoList: InfoList = await getStorageItem("infoList");

    if(infoList.current[0] === infoList.all.allowlist[0]) {
        infoList.current[0] = infoList.all.blocklist[0];
    }
    else {
        infoList.current[0] = infoList.all.allowlist[0];
    }

    await setStorageItem({name: "infoList", item: infoList});

    await updateIndicator();
}




async function updateIndicator(): Promise<void> {
    const infoList: InfoList = await getStorageItem("infoList");


    const indicator = document.getElementById("indicator");

    console.log(`updateing indicator with ${infoList.current[0].name}`)
    indicator.innerHTML = infoList.current[0].name;
}


updateIndicator()
    .then(() => document.addEventListener("click", buttonClickHandler))
    .catch(handelError);
