import browser from 'webextension-polyfill';
import InfoList from '../modules/infoList';
import List from '../modules/list';
import Settings from '../modules/settings';
import { getStorageItem, pullItem, setStorageItem } from '../modules/storage';
import Timer from '../modules/timer';
import type { TimerList } from '../modules/types';


import { handelError, isHttp, type Message } from '../modules/util';




const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");







browser.runtime.onInstalled.addListener(() => {

    async function init(): Promise<void> {

        // REMOVE THIS BEFORE RELEAE OH GOD @@@@@@@@@@@@@@@@@@@@@@@@
        await browser.storage.local.clear();

        await Settings.init();

        await InfoList.init();
        await setStorageItem("timerList", []);


        
        

        await test();

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

        const test = await infoList.registerNewList("this is a space", "block");
        test.toggleActive();

        const testList = await test.pullList();
        testList.addEntry(List.createEntry("fullDomain", "https://www.wikipedia.org/"));
        await testList.save();

        await test.toggleTimer();
        const timer = await test.pullTimer();
        
        await timer.setMax(1);




        // for (let i = 0; i < 20; i++) {
        //     const t = await infoList.registerNewList(`test${i}`, "block");
        //     t.toggleActive();
        //     const l = await t.pullList();
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     l.addEntry(List.createEntry("fullDomain", `https://www.wikipedia.org/`));
        //     await l.save();

        //     await t.toggleTimer();
        //     const te = await t.pullTimer();

        //     await te.setMax(1);
        // }

    }


    init().catch(handelError);
    
   
    
    
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




    for (let i = 0; i < ids.length; i++) {
        const timer = new Timer(ids[i], await pullItem(ids[i]));
        if (timer.isDone()) {
            // remove timer from list since its done
            ids.splice(i, 1);
        } else {
            timer.start();
            lowestTime = Math.min(lowestTime, timer.timeLeft);
        }
    }

    await setStorageItem("timerList", ids);

    if (lowestTime === Number.POSITIVE_INFINITY) return;
    browser.alarms.create("blockTimer", { when: Date.now() + lowestTime });
}


async function manageTimers(): Promise<void> {
    
    
    await resetTimers();
    browser.alarms.clear("blockTimer");
    if (!await Settings.getSetting("isActive")) return;

    const tabs = await browser.tabs.query({ active: true });
    if (tabs.length === 0) throw new Error("manageTimers got an empty tab query");

    console.log(`------managing timers for ${tabs.length} tab${tabs.length === 1 ? "" : "s"}`);


    const infoList = new InfoList();
    await infoList.syncFromStorage();
    const timerList: TimerList = [];

    for (const tab of tabs) {
        if (tab.url === undefined) continue;
        if (!isHttp(tab.url)) continue;

        const infos = await infoList.getActiveMatch(tab.url);

        for (const info of infos) {
            if (info.useTimer) {
                timerList.push(info.timerId);
            }
        }

    }
    
    if (timerList.length === 0) return;
    await setTimers(timerList);
}





async function isMatch(url: string, infoList: InfoList): Promise<boolean> {

    const matchedInfos = await infoList.getActiveMatch(url);
    
    // this is not very pretty. If its in block mode then when there is a not done timer we DON'T match but in allow mode we DO match
    // vise versa for done timers so we do this "thing"
    const listStatus = infoList.activeMode === "block";

    for (const info of matchedInfos) {
        if (info.useTimer) {
            const timer = await info.pullTimer();
            if (timer.isDone()) {
                return listStatus;
            } else if(infoList.activeMode === "allow") {
                return true;
            }
        } else {
            return true;
        }
    }

    return false;
}


function block(url: string, tabId: number) {
    console.log(`BLOCKING a page with a url of ${url}`);
    browser.tabs.update(tabId, { url: blockedPageURL + `?url=${url}` });
}


async function check(url: string, tabId: number): Promise<void> {
    const startTime = Date.now();



    let urlIsBlockedPage = false;

    if (url.includes(blockedPageURL)) {
        const regexArray = /(?<=\?url=).*/.exec(url);
        if (regexArray === null) throw new Error(`Getting url from "Blocked Page" resulted in null`);
        url = regexArray[0];
        urlIsBlockedPage = true;
    }

    if (!isHttp(url)) {
        console.log(`CHECK TOOK ------------------------------ ${Date.now() - startTime}`);
        return
    };

    if (!await Settings.getSetting("isActive")) {
        if (urlIsBlockedPage) browser.tabs.update(tabId, { url: url }).catch(handelError);
        console.log(`CHECK TOOK ------------------------------ ${Date.now() - startTime}`);
        return;
    }


    console.log(`------checking${urlIsBlockedPage ? " Blocked Page " : " "}${url} on tab ${tabId}`);


    const infoList = new InfoList();
    await infoList.syncFromStorage();

    const matched = await isMatch(url, infoList);

    // same as this: if ((matched && infoList.activeMode === "block") || (!matched && infoList.activeMode === "allow")) 
    if ((matched === (infoList.activeMode === "block")) && !urlIsBlockedPage) {
        block(url, tabId);
        console.log(`CHECK TOOK ------------------------------ ${Date.now() - startTime}`);
        return;
    }
    
    // I didn't check super well if this works and I don't know how it works but it does so I'm leaving it how it is.
    if ((!matched === (infoList.activeMode === "block")) && urlIsBlockedPage) {
        browser.tabs.update(tabId, { url: url }).catch(handelError);
    }
    console.log(`CHECK TOOK ------------------------------ ${Date.now() - startTime}`);

}



async function checkAll() {
    // gets all tabs
    const allTabs = await browser.tabs.query({});
    for (const tab of allTabs) {
        if (tab.url !== undefined && tab.id !== undefined) {
            await check(tab.url, tab.id);
        }
    }
}





browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    if (navigate.frameId !== 0) return;
    console.log("doing on navigate");

    async function navigated() {
        await check(navigate.url, navigate.tabId).catch(handelError);
    }

    navigated().catch(handelError);
    

}, { url: [{ urlMatches: "https://*/*" }, { urlMatches: "http://*/*" }] });




browser.tabs.onActivated.addListener((activeInfo) => {
    console.log("on activated");

    async function activated(tab: browser.Tabs.Tab) {
        if (tab.id !== undefined && tab.url !== undefined) {
            console.log("doing on activated");
            await manageTimers();
            await check(tab.url, tab.id);
        }
    }


    browser.tabs.get(activeInfo.tabId).then(activated).catch(handelError);
});



// would filter this but chrome does not have support for that :/
browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    console.log("on updated");
    
    async function updated(tab: browser.Tabs.Tab) {
        if (tab.id !== undefined && tab.url !== undefined) {
            const active = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
            if (active.id === tab.id && active.url === tab.url) {
                console.log("doing on updated");
                await manageTimers();

                if (changeInfo.status !== "loading") check(tab.url, tab.id);
            }
        }
    }

    // if an onUpdate event is fired and it has no url we don't care about it
    if (changeInfo.url === undefined) return;



    updated(tab).catch(handelError);
});



browser.alarms.onAlarm.addListener((alarm) => {
    console.log("timer went off");

    async function alarmed() {
        await manageTimers();
        await checkAll();
    }

    if (alarm.name === "blockTimer") {
       alarmed().catch(handelError); 
    }
});



browser.runtime.onMessage.addListener((message) => {
    async function messaged(message: Message): Promise<void> {
        // switch message.id if more are added
        if (message.for === "backgroundScript" && message.id === "update") {
            await manageTimers();
            await checkAll();
        }
    }
    messaged(message).catch(handelError);

});

browser.storage.onChanged.addListener((changes) => {
    console.table(changes);

});








