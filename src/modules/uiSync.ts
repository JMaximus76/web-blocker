import type { Subscriber } from "svelte/store";
import type Storage from "./storage";
import { sendMessage } from "./util";



export default class UiSync {


    #set: Subscriber<object>;
    #update: Storage["update"];
    
    constructor(set: Subscriber<object>, update: Storage["update"]) {
        this.#set = set;
        this.#update = update;
    }


    proxy<T extends object>(obj: T, key: string) {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                this.#set(this);
                sendMessage({for: "uiSync", id: key, item: target})
                return true;
            }
        });
    }


}