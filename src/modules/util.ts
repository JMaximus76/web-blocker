import browser from "webextension-polyfill";



type MessageTemplate = {
    target: string;
    map: Record<string, any>;
};




type Message<T extends MessageTemplate> = {
    target: T["target"];
    id: keyof T["map"];
    data: T["map"][keyof T["map"]];
}




export function makeMessageSender<T extends MessageTemplate>(target: T["target"]) {
    return async function sender<U extends keyof T["map"]>(details: T["map"][U] extends undefined ? {id: U} : { id: U, data: T["map"][U] }) {
        const data = (Object.hasOwn(details, "data")) ? (details as { id: U, data: T["map"][U] }).data : undefined;
        await browser.runtime.sendMessage({target, id: details.id, data});
    }
}




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
















