import browser from "webextension-polyfill";


export type Message = {
    for: "infoList" | "settings" | "backgroundScript";
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
    // only doing http becaus this also matches on https
    const regexArray = /^http/.exec(url);
    return regexArray !== null;
}



export async function sendMessage(message: Message) {
    await browser.runtime.sendMessage(message);
}








