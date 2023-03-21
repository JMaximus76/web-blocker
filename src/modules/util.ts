import browser from "webextension-polyfill";




type oldMessage<T extends MessageTemplate> = {
    target: T["target"];

    map: {
        
        [K in keyof T["map"]]: {
            [L in K]: T["map"][K];
        };
    }[keyof T["map"]];
} 

const test: oldMessage<testMT> = {
    target: "test",
    map: {
        a: {
            foo: true,
            bar: "you"
        },
        b: false
    }
}




type MessageTemplate = {
    target: string;
    map: Record<string, any>;
};


type old2Message<T extends MessageTemplate, U extends keyof T["map"]> = {
    target: T["target"];
    id: U;
    data: T["map"][U];
}

type Message<T extends MessageTemplate> = {
    target: T["target"];
    id: keyof T["map"];
    data: T["map"][keyof T["map"]];
}



type testMT = {
    target: "test";
    map: {
        a: {
            foo: boolean;
            bar: string;
        };
        b: boolean;
    }
}

// export async function sendMessage<T extends MessageTemplate>(message: Message<T>): Promise<void> {
//     browser.runtime.sendMessage(message).catch((e) => console.log(`Message bounced ${e}`));
// }

function sendMessage<T extends MessageTemplate>(message: Message<T>): Promise<void>;
function sendMessage<T extends MessageTemplate>(message: Omit<Message<T>, "id">): Promise<void>;

async function sendMessage<T extends MessageTemplate>(message: Message<T> | Omit<Message<T>, "id">): Promise<void> {
    browser.runtime.sendMessage(message).catch((e) => console.log(`Message bounced ${e}`));
}


sendMessage<testMT>({target: "test", data: false});




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
















