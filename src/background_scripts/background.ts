import browser from 'webextension-polyfill';
import InfoList from '../modules/infoList';
import List from '../modules/list';
import { getStorageItem, pullItem, setStorageItem } from '../modules/storage';
import Timer from '../modules/timer';


import { handelError } from '../modules/util';




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
        testList.addEntry(List.createEntry("domain", "https://www.wikipedia.org/"));
        await testList.save();

        await test.toggleTimer();
        const timer = await test.pullTimer();
        
        await timer.setMax(1);

    }


    init().then(test).catch(handelError);
    
   
    
    
});



// gets all timers off timerList (the timers that are were active) and totals them
async function resetTimers(): Promise<Timer[]> {
    const timerList = await getStorageItem("timerList");
    const timers: Timer[] = [];

    for (const id of timerList) {
        const index = timers.push(new Timer(id, await pullItem(id)));
        await timers[index - 1].totalUp();
    }

    if (timerList.length !== 0) await setStorageItem("timerList", []);
    return timers;
}



// i regret making this

async function check(url: string, tabId: number): Promise<void> {

    function block() {
        if (url.includes(blockedPageURL)) return;
        if (url.includes("about:")) return;
        if (url.includes("chrome://")) return;
        console.log(`BLOCKING a page with a url of ${url}`);
        browser.tabs.update(tabId, { url: blockedPageURL + `?url=${url}` });
    }

    console.log(`checking ${url} on tab ${tabId}`);

    browser.alarms.clear("blockTimer");

    
    // const timers is used later so that you dont have to pull the timers again (only if they are needeed)
    // resets timerList to empty at the end
    const timers: Timer[] = await resetTimers();

    
    const infoList = new InfoList();
    await infoList.syncFromStorage();


    // infoList.activeInfos will get all the infos that are active and in the activeMode (block or allow)
    // if its empty then there are no lists for the current mode so do nothing (or block if in allow mode)
    if (infoList.activeInfos.length === 0 ) {
        if (infoList.activeMode === "allow") block();
        return;
    }

    const infos = await infoList.getActiveMatch(url);

    if (infos.length === 0) {
        if (infoList.activeMode === "allow") block();
        return;
    }

    // use promise because it should make the loop faster, 
    // some of the paths in loop will return and this funciton needs to be fast because its called a lot
    const newTimers: Promise<Timer>[] = [];

    for (const info of infos) {
        if (info.useTimer) {

            const index = timers.map((timer) => timer.id).indexOf(info.timerId);
            if (index === -1) {
                newTimers.push(info.pullTimer());
            } else {
                newTimers.push(Promise.resolve(timers[index]));
            }

        } else if (infoList.activeMode === "block") {
            block();
            return;
        }
    }


    const timerList = [];
    let lowestTimer: number = 0;

    for (const p of newTimers) {
        const  timer = await p;

        if (timer.isDone() && infoList.activeMode === "block") {
            block();
            return;
        }

        const timeLeft = timer.start();
        
        if (lowestTimer === 0 || timeLeft < lowestTimer) {

            lowestTimer = timeLeft;
        }

        timerList.push(timer.id);

        
    }

    await setStorageItem("timerList", timerList);


   

    browser.alarms.create("blockTimer", { when: Date.now() + lowestTimer });

}




browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    
    
    if (navigate.frameId !== 0) return;

    console.log("on navigate");
    check(navigate.url, navigate.tabId).catch(handelError);

}, { url: [{ urlMatches: "https://*/*" }, { urlMatches: "http://*/*" }] });




browser.tabs.onActivated.addListener((activeInfo) => {
    console.log("on activated")


    browser.tabs.get(activeInfo.tabId).then((tab) => {
        if (tab.id !== undefined && tab.url !== undefined) {
            check(tab.url, tab.id);
        }
    }).catch(handelError);
});



browser.alarms.onAlarm.addListener((alarm) => {
    console.log("timer went off");

    if (alarm.name === "blockTimer") {
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs.length === 0) return;
            if (tabs[0].url === undefined || tabs[0].id === undefined) return;
            check(tabs[0].url, tabs[0].id);
        }).catch(handelError);
    }
});



browser.storage.onChanged.addListener((changes) => {
    console.table(changes);

});








