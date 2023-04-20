import browser from 'webextension-polyfill';
import ItemServer from '../modules/itemServer';
import ListServer from '../modules/listServer';

import { handelError, isHttp, makeServers, type Id, type Message, type Servers } from '../modules/util';




const blockedPageURL = browser.runtime.getURL("/src/blocked_page/blocked-page.html");


// want to implement but won't because of time

// use browser.webRequest instead of navigate
// set up message link for storage
// beter handling of active vs deactive mode (make somethign to turn all timers off and cut the events right at the start instead of in funcitons)





browser.runtime.onInstalled.addListener((details) => {


    // async function test(): Promise<void> {

    //     ListServer.init();
    //     ItemServer.init();


    //     const listServer = new ListServer();
    //     await listServer.sync();

    //     const blockListID = listServer.registerList({name: "Block List", mode: "block"});
    //     const blockEntries = new EntryController(await listServer.getId("entries", blockListID));
    //     blockEntries.addEntry("domain", "https://www.youtube.com/");
    //     blockEntries.addEntry("domain", "https://www.netflix.com/");
    //     blockEntries.addEntry("url", "https://commons.wikimedia.org/wiki/Main_Page");

    //     const allowListID = listServer.registerList({name: "Allow List", mode: "allow"});
    //     const allowEntries = new EntryController(await listServer.getId("entries", allowListID));
    //     allowEntries.addEntry("domain", "https://www.freecodecamp.org/");
    //     allowEntries.addEntry("domain", "https://www.learncpp.com/");
    //     allowEntries.addEntry("domain", "https://www.google.com/");


    //     const testID = listServer.registerList({name: "Test List", mode: "block", useTimer: true, maxInMin: 1, locked: true});
    //     const testEntries = new EntryController(await listServer.getId("entries", testID));
    //     testEntries.addEntry("fullDomain", "https://www.wikipedia.org/");
        

    //     for (let i = 0; i < 20; i++) {
    //         const id = listServer.registerList({name: `test${i}`, mode: "block", useTimer: true, maxInMin: 1});
    //         const entries = new EntryController(await listServer.getId("entries", id));
    //         for (let j = 0; j < 20; j++) {
    //             entries.addEntry("fullDomain", `https://www.wikipedia.org/`);
    //         }
    //     }
    // }




    async function init(): Promise<void> {
        ListServer.init();
        ItemServer.init();

        const listServer = new ListServer();
        await listServer.sync();
        listServer.registerList({name: "Block List", mode: "block"});
        const allowListID = listServer.registerList({name: "Allow List", mode: "allow"});
        const allowEntries = await listServer.getId("entries", allowListID);
        allowEntries.addEntry("fullDomain", "https://www.google.com/");

        const socialListId = listServer.registerList({name: "Social Media", mode: "block"});
        const socialEntries = await listServer.getId("entries", socialListId);
        socialEntries.addEntry("fullDomain", "https://www.facebook.com/");
        socialEntries.addEntry("fullDomain", "https://www.instagram.com/");
        socialEntries.addEntry("fullDomain", "https://www.twitter.com/");
        socialEntries.addEntry("fullDomain", "https://www.reddit.com/");
        socialEntries.addEntry("fullDomain", "https://www.youtube.com/");
        socialEntries.addEntry("fullDomain", "https://www.tiktok.com/");
        const socialTimer = await listServer.getId("timer", socialListId);
        socialTimer.max = 30;

        console.log("init done")
    }


    async function installed() {
        // if (details.temporary) {
        //     await browser.storage.local.clear();
        //     await init();
        //     await validateStorage();
        // }
        
        // if (details.reason === "install") {
        //     await init();
        // }

        await browser.storage.local.clear();
        await init();
    }

    installed().catch(handelError);

});


// async function validateStorage() {
//     const storage = await browser.storage.local.get();
    
//     const newStorage = {
//         ...ListServer.validate(storage),
//         ...ItemServer.validate(storage)
//     }

//     const newKeys = Object.keys(newStorage);
//     for (const key of Object.keys(storage)){
//         if (!newKeys.includes(key)) {
//             await browser.storage.local.remove(key);
//             console.log("ho no")
//         }
//     }


//     await browser.storage.local.set(newStorage);
// }


browser.runtime.onStartup.addListener(() => {

    async function onStartup() {
        // await validateStorage();
        await setTimerResets();

    }

    onStartup().catch(handelError);
});



async function resetTimers() {
    const listServer = new ListServer();
    await listServer.sync();

    const timerList = await listServer.request("timer", {});
    timerList.forEach(timer => timer.reset());
    checkAll({listServer, itemServer: new ItemServer()});
}

async function setTimerResets() {
    const itemServer = new ItemServer();
    const runtimeSettings = await itemServer.get("runtimeSettings");
    const now = new Date();
    const millisecondsinDay = 1000 * 60 * 60 * 24;

    if (runtimeSettings.resetTime + millisecondsinDay <= now.getTime()) {
        resetTimers();
        runtimeSettings.resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    }

    browser.alarms.create("resetTimers", { when: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime() - now.getTime() });
}

async function clearTimers(listServer: ListServer, itemServer: ItemServer) {
    const activeTimers = await itemServer.get("activeTimers");
    const timers = await listServer.getIds("timer", activeTimers);

    timers.forEach(timer => timer.stop());
    activeTimers.length = 0;
    browser.alarms.clear("blockTimer");
}




async function manageTimers({ listServer, itemServer }: Servers): Promise<void> {

    await clearTimers(listServer, itemServer);

    const runtimeSettings = await itemServer.get("runtimeSettings");
    const timerList = await itemServer.get("activeTimers");

    const tabs = await browser.tabs.query({ active: true });
    if (tabs.length === 0) throw new Error("manageTimers got an empty tab query");

    //console.log(`------managing timers for ${tabs.length} tab${tabs.length === 1 ? "" : "s"}`);


    let lowestTime = Number.POSITIVE_INFINITY;

    for (const tab of tabs) {
        if (tab.url === undefined) continue;
        if (!isHttp(tab.url)) continue;

        const timers = await listServer.request("timer", {active: true, mode: runtimeSettings.mode, useTimer: true, match: tab.url, activeTimer: false});

        for (const timer of timers) {
            timerList.push(timer.id);
            timer.start();
            lowestTime = Math.min(lowestTime, timer.timeLeft);
        }

    }

    if (lowestTime !== Number.POSITIVE_INFINITY) {
        browser.alarms.create("blockTimer", { when: Date.now() + lowestTime });
    }
}



async function unBlockAll() {
    const tabs = await browser.tabs.query({});

    for (const tab of tabs) {
        if (tab.url === undefined) continue;
        const regexArray = /(?<=\?url=).*/.exec(tab.url);
        if (regexArray === null) continue;
        const url = regexArray[0];
        browser.tabs.update(tab.id, { url: url });
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

    const runtimeSettings = await itemServer.get("runtimeSettings");

    //console.log(`------checking${urlIsBlockedPage ? " Blocked Page " : " "}${url} on tab ${tabId}`);

    // I mean at this point I feel like I should just make a listServer function that checks a url and return a boolean
    // but then again it would literally just be this and this is the only place that would use it
    const infos = await listServer.request("info", {active: true, mode: runtimeSettings.mode, match: url, activeTimer: true});


    let doBlocking = runtimeSettings.mode === "allow";
    if (infos.length !== 0) doBlocking = !doBlocking;

    if (doBlocking && !urlIsBlockedPage) {
        //console.log(`BLOCKING a page with url of ${url}`);
        browser.tabs.update(tabId, { url: blockedPageURL + `?url=${url}` });
    } else if (!doBlocking && urlIsBlockedPage) {
        //console.log(`UNBLOCKING page with url of ${url}`);
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
    //console.log("doing on navigate");

    async function navigated() {
        const servers = await makeServers();
        if ((await servers.itemServer.get("runtimeSettings")).isActive) {
            await check(navigate.url, navigate.tabId, servers);
        }
        
    }

    navigated().catch(handelError);
    

}, { url: [{ urlMatches: "https://*/*" }, { urlMatches: "http://*/*" }] });




browser.tabs.onActivated.addListener((activeInfo) => {
    //console.log("on activated");

    async function activated(tab: browser.Tabs.Tab) {
        if (tab.id !== undefined && tab.url !== undefined) {
            //console.log("doing on activated");
            const servers = await makeServers();

            if ((await servers.itemServer.get("runtimeSettings")).isActive) {
                await manageTimers(servers);
                await check(tab.url, tab.id, servers);
            }
        }
    }


    browser.tabs.get(activeInfo.tabId).then(activated).catch(handelError);
});



// would filter this but chrome does not have support for that :/
browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    //console.log("on updated");
    
    async function updated(tab: browser.Tabs.Tab) {
        if (tab.id !== undefined && tab.url !== undefined) {
            const active = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
            if (active.id === tab.id && active.url === tab.url) {
                //console.log("doing on updated");
                const servers = await makeServers();
                if ((await servers.itemServer.get("runtimeSettings")).isActive) {
                    await manageTimers(servers);
                    if (changeInfo.status !== "loading") check(tab.url, tab.id, servers);
                }
            }
        }
    }

    // if an onUpdate event is fired and it has no url we don't care about it
    if (changeInfo.url === undefined) return;



    updated(tab).catch(handelError);
});



browser.alarms.onAlarm.addListener((alarm) => {
    //console.log("timer went off");

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
            setTimerResets().catch(handelError);
            break;
    }



});




browser.runtime.onMessage.addListener((message) => {

    async function messaged(message: Message): Promise<void> {
        // switch message.id if more are added
        if (message.target === "background" && message.id as Id<"background"> === "update") {
            const servers = await makeServers();
            await manageTimers(servers);

            // when isActive is changed this should be called first
            if ((await servers.itemServer.get("runtimeSettings")).isActive) {
                await checkAll(servers);
            } else {
                await unBlockAll();
                browser.alarms.clearAll();
                await manageTimers(servers);
                await clearTimers(servers.listServer, servers.itemServer);

            }
        }
    }

    //console.log("got message");
    messaged(message).catch(handelError);

});


// browser.storage.local.onChanged.addListener((changes) => {

//     console.table(changes);
    
// });










