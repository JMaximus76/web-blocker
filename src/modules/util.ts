import browser from "webextension-polyfill";



export type Message = {
    for: "infoList" | "settings" | "backgroundScript" | "timerStore";
    id: string;
    item?: any;
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

export function isURL(url: string): boolean {
    const regexArray = /^https?:\/\/.*\..*\//.exec(url);
    return regexArray !== null;
}



export async function sendMessage(message: Message) {
    await browser.runtime.sendMessage(message).catch(() => {/* do nothing */});
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
















