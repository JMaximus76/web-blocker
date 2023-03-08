import browser from 'webextension-polyfill';
import InfoList from '../modules/infoList';
import List from '../modules/list';
import { getStorageItem, pullItem, setStorageItem } from '../modules/storage';
import Timer from '../modules/timer';
import type { TimerList } from '../modules/types';


import { handelError, isHttp, type Message } from '../modules/util';




const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");







browser.runtime.onInstalled.addListener(() => {

    async function init(): Promise<void> {

        // REMOVE THIS BEFORE RELEAE OH GOD @@@@@@@@@@@@@@@@@@@@@@@@
        await browser.storage.local.clear();



        await InfoList.init();
        await setStorageItem("timerList", []);


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

    async function test(): Promise<void> {
        const infoList = new InfoList();
        await infoList.syncFromStorage();

        const test = await infoList.registerNewList("test", "block");
        test.toggleActive();

        const testList = await test.pullList();
        testList.addEntry(List.createEntry("fullDomain", "https://www.wikipedia.org/"));
        await testList.save();

        await test.toggleTimer();
        const timer = await test.pullTimer();
        
        await timer.setMax(1);

    }


    init().then(test).catch(handelError);
    
   
    
    
});



// gets all timers off timerList (the timers that are were active) and totals them
async function resetTimers() {
    const timerList = await getStorageItem("timerList");

    for (const id of timerList) {
        const timer = new Timer(id, await pullItem(id))
        await timer.totalUp();
    }

    if (timerList.length !== 0) await setStorageItem("timerList", []);

}


async function setTimers(ids: TimerList): Promise<void> {

    if (ids.length === 0) throw new Error("setTimers was given an empty TimerList");

    
    let lowestTime = Number.POSITIVE_INFINITY;

    for (const id of ids) {
        const timer= new Timer(id, await pullItem(id));
        if (timer.isDone()) continue;
        timer.start();
        lowestTime =  Math.min(lowestTime, timer.timeLeft);
    }

    await setStorageItem("timerList", ids);

    if (lowestTime === Number.POSITIVE_INFINITY) return;
    browser.alarms.create("blockTimer", { when: Date.now() + lowestTime });
}


async function manageTimers(url: string): Promise<void> {
    console.log(`------managing timers for url: ${url}`);
    await resetTimers();
    browser.alarms.clear("blockTimer");

    // we do this down here instead of at the start because we want this to remove and total all current timers even if its not http
    // we only want to set new timers if its http so we return 
    if (!isHttp(url)) return;

    const infoList = new InfoList();
    await infoList.syncFromStorage();

    const infos = await infoList.getActiveMatch(url);

    const timerList: TimerList = [];

    for (const info of infos) {
        if (info.useTimer) {
            timerList.push(info.timerId);
        }
    }
    if (timerList.length === 0) return;
    await setTimers(timerList);
}




async function check(url: string, tabId: number): Promise<void> {

    function block() {
        if (isBlockedPage) return;
        console.log(`BLOCKING a page with a url of ${url}`);
        browser.tabs.update(tabId, {  url: blockedPageURL + `?url=${url}` });
    }

    let isBlockedPage = false;

    if (url.includes(blockedPageURL)) {
        console.log("checking BLOCK PAGE");
        const regexArray = /(?<=\?url=).*/.exec(url);
        if (regexArray === null) throw new Error(`Getting url from "Blocked Page" resulted in null`);
        url = regexArray[0];
        isBlockedPage = true;
    }

    if (!isHttp(url)) return;

    console.log(`------checking ${url} on tab ${tabId}`);

    const infoList = new InfoList();
    await infoList.syncFromStorage();


    if (infoList.activeInfos.length === 0) {
        if (infoList.activeMode === "allow") {
            block();
        } else if (isBlockedPage) {
            browser.tabs.update(tabId, { url: url }).catch(handelError);
        }
        return;
    }

    const infos = await infoList.getActiveMatch(url);

    if (infos.length === 0) {
        if (infoList.activeMode === "allow") {
            block();
        } else if (isBlockedPage) {
            browser.tabs.update(tabId, { url: url }).catch(handelError);
        }
        return;
    }


    for (const info of infos) {
        if (info.useTimer) {
            const timer = await info.pullTimer();

            if (infoList.activeMode === "block") {
                if (timer.isDone()) {
                    block();
                    return;
                } else {
                    continue;
                }
            } else {
                if (timer.isDone()) {
                    continue;
                } else {
                    if (isBlockedPage) {
                        browser.tabs.update(tabId, { url: url }).catch(handelError);
                    }
                    return;
                }
            }

        } else {
            if (infoList.activeMode === "block") block();
            return;
        } 
    }

    if (infoList.activeMode === "allow") {
        block();
    } else if (isBlockedPage) {
        browser.tabs.update(tabId, { url: url }).catch(handelError);
    }
    return;
}






browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    if (navigate.frameId !== 0) return;
    console.log("doing on navigate");
    check(navigate.url, navigate.tabId).catch(handelError);

}, { url: [{ urlMatches: "https://*/*" }, { urlMatches: "http://*/*" }] });




browser.tabs.onActivated.addListener((activeInfo) => {
    console.log("on activated");

    async function activated(tab: browser.Tabs.Tab) {
        if (tab.id !== undefined && tab.url !== undefined) {
            console.log("doing on activated");
            await manageTimers(tab.url);
            await check(tab.url, tab.id);
        }
    }


    browser.tabs.get(activeInfo.tabId).then(activated).catch(handelError);
});


browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    console.log("on updated");
    
    async function updated(tab: browser.Tabs.Tab) {
        if (tab.id !== undefined && tab.url !== undefined) {
            const active = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
            if (active.id === tab.id && active.url === tab.url) {
                console.log("doing on updated");
                await manageTimers(tab.url);
                await check(tab.url, tab.id);
            }
        }
    }

    if (changeInfo.url === undefined) return;
    updated(tab).catch(handelError);
});



browser.alarms.onAlarm.addListener((alarm) => {
    console.log("timer went off");

    async function alarmed() {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
         
        if (tabs.length === 0) throw new Error("onAlarm blockTimer: got a query array of length 0");
        const tab = tabs[0];

        if (tab.url === undefined || tab.id === undefined) throw new Error("onAlarm blockTimer: url or id was undefined");

        await manageTimers(tab.url);
        await check(tab.url, tab.id);
    }

    if (alarm.name === "blockTimer") {
       alarmed().catch(handelError); 
    }
});

browser.runtime.onMessage.addListener((message) => {
    

    async function messaged(message: Message): Promise<void> {
        if (message.for !== "backgroundScript") return;

        const allTabs = await browser.tabs.query({});

        for (const tab of allTabs) {
            if (tab.url !== undefined && tab.id !== undefined) {
                await check(tab.url, tab.id);
            }
        }
    }

    messaged(message).catch(handelError);

});

browser.storage.onChanged.addListener((changes) => {
    console.table(changes);

});








