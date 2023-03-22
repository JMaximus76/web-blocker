import browser from "webextension-polyfill";
import ItemServer from "./itemServer";
import ListServer from "./listServer";





type M = {
    storage: {
        modify: { key: string, value: object };
        add: { key: string, value: object };
        delete: string;
    };

    background: {
        update: undefined;
    };

    timerStore: {
        start: string;
        stop: string;
    }
}

export type Message = {
    target: keyof M;
    id: string;
    data: any;
}



export type Id<T extends keyof M> = keyof M[T];
export type Data<T extends keyof M, U extends keyof M[T]> = M[T][U];


export async function sendMessage<T extends keyof M, I extends keyof M[T], D extends M[T][I]>(target: T, id: I, data: D) {
    await browser.runtime.sendMessage({ target, id, data }).catch(() => console.log(`Message Bounced: ${{ target, id, data }}`));
}




// I'm sorry 
// export function makeMessageSender<Template extends MessageTemplate, Target extends keyof Template>(target: Target) {
//     return async function sender<Id extends keyof Template[Target]>(details: Template[Target][Id] extends undefined ? { id: Id } : { id: Id, data: Template[Target][Id] }) {
//         const data = (Object.hasOwn(details, "data")) ? (details as { id: Id, data: Template[Target][Id] }).data : undefined;
//         await browser.runtime.sendMessage({ target, id: details.id, data }).catch(() => console.log(`Message Bounced: ${{ target, id: details.id, data }}`));
//     }
// }

// export type MessageTemplate = {
//     [targets: string]: Record<string, any>;
// };









export type PromiseError = {
    message: Error;
    details?: any;
};




export function handelError(error: PromiseError) {
    console.error(error.message);
    if (error.details) console.table(error.details);
}


export function isHttp(url: string): boolean {
    const regexArray = /^https?:\/\//.exec(url);
    return regexArray !== null;
}

export function isBadURL(url: string): boolean {
    const regexArray = /^https?:\/\/[\w-]+\.[\w-]+/.exec(url);
    return (regexArray !== null) && !url.includes(" ");
}




export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



export function filterBlockPage(url: string) {
    if (url.includes(browser.runtime.getURL("/src/blocked_page/blocked-page.html"))) {
        const regexArray = /(?<=\?url=).*/.exec(url);
        if (regexArray === null) throw new Error(`Getting url from "Blocked Page" resulted in null`);
        url = regexArray[0];
    }
    return url;
}



export function jsonCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}



export async function makeServers() {
    const listServer = new ListServer();
    await listServer.sync();
    const itemServer = new ItemServer();

    return { listServer, itemServer };
}

export type Servers = {
    listServer: ListServer;
    itemServer: ItemServer;
};















