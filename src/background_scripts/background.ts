import browser from 'webextension-polyfill';
import EntryControler from '../modules/entryControler';
import ItemServer from '../modules/itemServer';
import ListServer from '../modules/listServer';
import TimerControler from '../modules/timerControler';
import { handelError, isHttp, makeServers, type Id, type Message, type Servers } from '../modules/util';




const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");


// want to implement but won't because of time

// use browser.webRequest instead of navigate
// set up message link for storage
// beter handling of active vs deactive mode (make somethign to turn all timers off and cut the events right at the start instead of in funcitons)





browser.runtime.onInstalled.addListener(() => {


    async function test(): Promise<void> {

        const listServer = new ListServer();
        await listServer.sync();

        const blockListID = listServer.registerList({name: "Block List", mode: "block"});
        const blockEntrys = new EntryControler(await listServer.getId("entrys", blockListID));
        blockEntrys.addEntry("domain", "https://www.youtube.com/");
        blockEntrys.addEntry("domain", "https://www.netflix.com/");
        blockEntrys.addEntry("url", "https://commons.wikimedia.org/wiki/Main_Page");

        const allowListID = listServer.registerList({name: "Allow List", mode: "allow"});
        const allowEntrys = new EntryControler(await listServer.getId("entrys", allowListID));
        allowEntrys.addEntry("domain", "https://www.freecodecamp.org/");
        allowEntrys.addEntry("domain", "https://www.learncpp.com/");
        allowEntrys.addEntry("domain", "https://www.google.com/");


        const testID = listServer.registerList({name: "Test List", mode: "block", useTimer: true, maxInMin: 1, locked: true});
        const testEntrys = new EntryControler(await listServer.getId("entrys", testID));
        testEntrys.addEntry("fullDomain", "https://www.wikipedia.org/");
        

        for (let i = 0; i < 20; i++) {
            const id = listServer.registerList({name: `test${i}`, mode: "block", useTimer: true, maxInMin: 1});
            const entrys = new EntryControler(await listServer.getId("entrys", id));
            for (let j = 0; j < 20; j++) {
                entrys.addEntry("fullDomain", `https://www.wikipedia.org/`);
            }
        }
    }

    async function init(): Promise<void> {

        // REMOVE THIS BEFORE RELEAE OH GOD @@@@@@@@@@@@@@@@@@@@@@@@
        // await browser.storage.local.clear();
        

        ListServer.init();
        ItemServer.init();
        
    
        await test();
    }


    init().catch(handelError);
    
});





async function resetTimers() {
    const listServer = new ListServer();
    await listServer.sync();

    const timerList = await listServer.request("timer", {});
    const timerControler = new TimerControler();

    timerList.forEach(timer => {
        timerControler.timer = timer;
        timerControler.reset();
    });

    checkAll({listServer, itemServer: new ItemServer()});
}

async function setTimerResets() {
    const itemServer = new ItemServer();
    const runtimeSettings = await itemServer.get("runtimeSettings");
    const currentDate = Date.now();

    const millisecondsinDay = 1000 * 60 * 60 * 24;

    if (runtimeSettings.resetTime + millisecondsinDay <= currentDate) {
        resetTimers();
        runtimeSettings.resetTime = currentDate - (currentDate % millisecondsinDay);
    }

    const nextResetTime = runtimeSettings.resetTime + millisecondsinDay;

    browser.alarms.create("resetTimers", { when: nextResetTime + 1 });
}


browser.runtime.onStartup.addListener(() => {
    setTimerResets().catch(handelError);
});





// hey future me:
// if you start getting weird behavior from the timers you might have a race condition with the ActiveTimers list
// when you reset it, it sends that to storage BUT if manageTimers is called very quickly after that it might not get the right list
// this would be bad, good luck *smile* (try putting async on eveything and just ingore them when using?)
async function manageTimers({ listServer, itemServer }: Servers): Promise<void> {


    const timerList = await itemServer.get("activeTimers");
    const timers = await listServer.getIds("timer", timerList);
    const timerControler = new TimerControler();

    timers.forEach(timer => {
        timerControler.timer = timer;
        timerControler.stop();
    });

    timerList.length = 0;
    
    browser.alarms.clear("blockTimer");
    const runtimeSettings = await itemServer.get("runtimeSettings");
    if (!runtimeSettings.isActive) return;

    const tabs = await browser.tabs.query({ active: true });
    if (tabs.length === 0) throw new Error("manageTimers got an empty tab query");

    console.log(`------managing timers for ${tabs.length} tab${tabs.length === 1 ? "" : "s"}`);


    let lowestTime = Number.POSITIVE_INFINITY;

    for (const tab of tabs) {
        if (tab.url === undefined) continue;
        if (!isHttp(tab.url)) continue;

        const timers = await listServer.request("timer", {active: true, mode: runtimeSettings.mode, useTimer: true, match: tab.url, activeTimer: false});

        
        
        for (const timer of timers) {
            timerControler.timer = timer;
            
            timerList.push(timerControler.id);
            timerControler.start();
            lowestTime = Math.min(lowestTime, timerControler.timeLeft);
            
        }

    }

    if (lowestTime !== Number.POSITIVE_INFINITY) {
        browser.alarms.create("blockTimer", { when: Date.now() + lowestTime });
    }
}







async function check(url: string, tabId: number, { listServer, itemServer }: Servers): Promise<void> {

    let urlIsBlockedPage = false;

    if (url.includes(blockedPageURL)) {
        const regexArray = /(?<=\?url=).*/.exec(url);
        if (regexArray === null) throw new Error(`Getting url from "Blocked Page" resulted in null`);
        url = regexArray[0];
        urlIsBlockedPage = true;
    }

    if (!isHttp(url)) return;


    // really should change this to the actual event listener instead of here 
    const runtimeSettings = await itemServer.get("runtimeSettings")
    if (!runtimeSettings.isActive) return;


    console.log(`------checking${urlIsBlockedPage ? " Blocked Page " : " "}${url} on tab ${tabId}`);

    // I mean at this point I feel like I should just make a listServer function that checks a url and return a boolean
    // but then again it would literally just be this and this is the only place that would use it
    const infos = await listServer.request("info", {active: true, mode: runtimeSettings.mode, match: url, activeTimer: true});


    let doBlocking = runtimeSettings.mode === "allow";
    if (infos.length !== 0) doBlocking = !doBlocking;

    if (doBlocking && !urlIsBlockedPage) {
        console.log(`BLOCKING a page with url of ${url}`);
        browser.tabs.update(tabId, { url: blockedPageURL + `?url=${url}` });
    } else if (!doBlocking && urlIsBlockedPage) {
        console.log(`UNBLOCKING page with url of ${url}`);
        browser.tabs.update(tabId, { url: url }).catch(handelError);
    }
}


// Make this better
async function checkAll(servers: Servers) {
    // gets all tabs
    const allTabs = await browser.tabs.query({});

    for (const tab of allTabs) {
        if (tab.url !== undefined && tab.id !== undefined) {
            await check(tab.url, tab.id, servers);
        }
    }
}





browser.webNavigation.onBeforeNavigate.addListener((navigate) => {
    if (navigate.frameId !== 0) return;
    console.log("doing on navigate");

    async function navigated() {
        await check(navigate.url, navigate.tabId, await makeServers()).catch(handelError);
    }

    navigated().catch(handelError);
    

}, { url: [{ urlMatches: "https://*/*" }, { urlMatches: "http://*/*" }] });




browser.tabs.onActivated.addListener((activeInfo) => {
    console.log("on activated");

    async function activated(tab: browser.Tabs.Tab) {
        if (tab.id !== undefined && tab.url !== undefined) {
            console.log("doing on activated");
            const servers = await makeServers();

            await manageTimers(servers);
            await check(tab.url, tab.id, servers);
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
                //console.log("doing on updated");
                const servers = await makeServers();

                await manageTimers(servers);

                if (changeInfo.status !== "loading") check(tab.url, tab.id, servers);
            }
        }
    }

    // if an onUpdate event is fired and it has no url we don't care about it
    if (changeInfo.url === undefined) return;



    updated(tab).catch(handelError);
});



browser.alarms.onAlarm.addListener((alarm) => {
    console.log("timer went off");

    async function blockTimer() {
        const servers = await makeServers();
        await manageTimers(servers);
        await checkAll(servers);
    }

    switch (alarm.name) {
        case "blockTimer":
            blockTimer().catch(handelError);
            break;
        case "resetTimers":
            resetTimers().catch(handelError);
            break;
    }



});




browser.runtime.onMessage.addListener((message) => {

    async function messaged(message: Message): Promise<void> {
        // switch message.id if more are added
        if (message.target === "background" && message.id as Id<"background"> === "update") {
            const servers = await makeServers();
            await manageTimers(servers);
            await checkAll(servers);
        }
    }

    console.log("got message");
    messaged(message).catch(handelError);

});


browser.storage.local.onChanged.addListener((changes) => {

    console.table(changes);
    
});










