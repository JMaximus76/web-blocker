import browser from "webextension-polyfill";



type MessageTemplate = {
    [targets: string]: Record<string, any>;
};


export function makeMessageSender<Template extends MessageTemplate, Target extends keyof Template>(target: Target) {
    return async function sender<Id extends keyof Template[Target]>(details: Template[Target][Id] extends undefined ? { id: Id } : { id: Id, data: Template[Target][Id] }) {
        const data = (Object.hasOwn(details, "data")) ? (details as { id: Id, data: Template[Target][Id] }).data : undefined;
        await browser.runtime.sendMessage({target, id: details.id, data});
    }
}

export type Message<T extends MessageTemplate> = {
    target: keyof T;
    id: keyof T[keyof T];
    data: T[keyof T][keyof T[keyof T]];
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
















