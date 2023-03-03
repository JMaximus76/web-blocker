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
        block.toggleActive();
        const blockList = await block.pullList();
        blockList.addEntry(List.createEntry("domain", "https://www.youtube.com/"));
        blockList.addEntry(List.createEntry("domain", "https://www.netflix.com/"));
        blockList.addEntry(List.createEntry("url", "https://commons.wikimedia.org/wiki/Main_Page"));
        await blockList.save();

        const allow = await infoList.registerNewList("Allowlist", "allow");
        allow.toggleActive();
        const allowList = await allow.pullList();
        allowList.addEntry(List.createEntry("domain", "https://www.freecodecamp.org/"));
        allowList.addEntry(List.createEntry("domain", "https://www.learncpp.com/"));
        allowList.addEntry(List.createEntry("domain", "https://www.google.com/"));
        await allowList.save();

    }


    init().catch(handelError);
    
   
    
    
});





browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    async function onNavigate(navigate: browser.WebNavigation.OnBeforeNavigateDetailsType): Promise<void> {
        console.log(`navigating to ${navigate.url}`);

        const infoList = new InfoList();
        await infoList.syncFromStorage();
        
        

        
        for (const info of infoList.activeInfos) {
            const list = await info.pullList();
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








