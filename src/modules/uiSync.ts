import type { Subscriber } from "svelte/store";
import type Storage from "./storage";
import type { Message } from "./util";
import browser from "webextension-polyfill";



export default class UiSync {


    #set: Subscriber<object>;
    #storage: Storage;
    
    constructor(set: Subscriber<object>, update: Storage["update"]) {
        this.#set = set;
        this.#update = update;
        browser.runtime.onMessage.addListener(onMessage);
    }


    proxy<T extends object>(obj: T, key: string) {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                this.#set(this);
                return true;
            }
        });
    }


    onMessage(message: Message) {
        if (message.for === "uiSync") {
            this.#update();
        }
    }


}