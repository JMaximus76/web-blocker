import browser from 'webextension-polyfill';
import InfoList from '../modules/infoList';
import List from '../modules/list';

import { handelError } from '../modules/util';




const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");







browser.runtime.onInstalled.addListener(() => {

    async function init(): Promise<void> {
        await InfoList.init();
        const infoList = new InfoList();
        await infoList.syncFromStorage();
        

        const block = await infoList.registerNewList("Blocklist", "block");
        const blockList = await block.list;

        blockList.addEntry(List.createEntry("domain", "https://www.youtube.com/"));
        blockList.addEntry(List.createEntry("domain", "https://www.netflix.com/"));
        blockList.addEntry(List.createEntry("url", "https://commons.wikimedia.org/wiki/Main_Page"));
        await blockList.save();

        const allow = await infoList.registerNewList("Allowlist", "allow");
        const allowList = await allow.list;
        allowList.addEntry(List.createEntry("domain", "https://www.freecodecamp.org/"));
        allowList.addEntry(List.createEntry("domain", "https://www.learncpp.com/"));
        allowList.addEntry(List.createEntry("domain", "https://www.google.com/"));
        await allowList.save();
    }


    init().catch(handelError);
    
   
    
    
});












browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    async function onNavigate(navigate: browser.WebNavigation.OnBeforeNavigateDetailsType): Promise<void> {

        const infoList = new InfoList();
        await infoList.syncFromStorage();

        const activeInfos = infoList.activeInfos;

        
        for (const info of activeInfos) {
            const list = await info.list;
            const match = list.check(navigate.url);
            const doBlocking = (match && info.mode === "block") || (!match && info.mode === "allow");
            if (doBlocking) {
                console.log(`BLOCKING a page with a url of ${navigate.url}`);
                await browser.tabs.update(navigate.tabId, { url: blockedPageURL + `?url=${navigate.url}` });
                return;
            }
        }
    }




    if (navigate.frameId !== 0) return;
    if (navigate.url.includes(blockedPageURL)) return;
    onNavigate(navigate).catch(handelError);
}, { url: [{ urlMatches: "https://*/*" }, { urlMatches: "http://*/*" }] });












// browser.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    
//     async function timerUpdate(url: string): Promise<void> {
//         const active = await getActiveLists();
//         if (!active) return;

//         await setTimers(url);
//     }
    
    
//     if (changeInfo.url) {
//         timerUpdate(changeInfo.url).catch(handelError);
//     }

// });






// browser.tabs.onActivated.addListener((activeInfo) => {
//     async function timerUpdate(): Promise<void> {
//         const active = await getActiveLists();
//         if (!active) return;
        
//         const tab = await browser.tabs.get(activeInfo.tabId);
//         if (!tab.url) return;

//         await setTimers(tab.url);
//     }

//     timerUpdate().catch(handelError);
// });







// browser.alarms.onAlarm.addListener((alarm) => {
//     async function timerUpdate(alarm: browser.Alarms.Alarm): Promise<void> {
//         const timer: StorageTimer | undefined = (await browser.storage.local.get(alarm.name))[alarm.name];
//         if (timer === undefined) {
//             console.error(new Error(`Timer ${alarm.name} not found`));
//         }

//         timer!.total += 1;

//         await browser.storage.local.set({ [alarm.name]: timer });
//     }
    

//     timerUpdate(alarm).catch(handelError);
// });






