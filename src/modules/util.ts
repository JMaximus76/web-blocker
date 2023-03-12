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
    // only doing http becaus this also matches on https
    const regexArray = /^http/.exec(url);
    return regexArray !== null;
}



export async function sendMessage(message: Message) {
    await browser.runtime.sendMessage(message).catch(() => {/* do nothing */});
}









export function formatTime(time: number): string {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;

    const h = Math.trunc(time / hour);
    const m = Math.trunc((time - h * hour) / minute);
    const s = Math.trunc((time - h * hour - m * minute) / second);



    if (h === 0) return `${(m < 10 ? "0" : "") + m}:${(s < 10 ? "0" : "") + s}`;
    return `${(h < 10 ? "0" : "") + h}:${(m < 10 ? "0" : "") + m}:${(s < 10 ? "0" : "") + s}`;
}








