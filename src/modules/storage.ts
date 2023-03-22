import browser from 'webextension-polyfill';
import { jsonCopy, sendMessage, type Data, type Message } from './util';




// dont' think I'll need to seal the objects because typescript should make sure I don't 
// add any properties to them. And I also need to add props for the entry lists so... not sure.

export default class Storage {

    // should work like a singleton so that across all instances of storage they all share the same cache
    static #cache: Record<string, object | undefined> = {};



    // WON"T WORK BECAUSE listening aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    // private constructor() {};
    // static #self: Storage;
    // public static get Instance() {
    //     return this.#self || (this.#self = new this());
    // }

    /** Gets keys from cache or local storage.
     *  If key does not exist in either location it throws an error.
    */
    async get<T extends object>(keys: string | string[]): Promise<(T | undefined)[]> {
        if (typeof keys === "string") keys = [keys];

        // gets all items from cache, some of those might be undefined so we get those from local storage.
        // if its also undefined in local storage will return undefined for that key.
        const items: (object | undefined)[] = [];
        for (const key of keys) {
            const item = Object.hasOwn(Storage.#cache, key) ? Storage.#cache[key] : await this.#getLocalStorage(key);

            if (typeof item === "object") {
                items.push(this.#makeProxy(key, item));
            } else {
                items.push(item);
            }
            
        }
        return items as (T | undefined)[];
    }


    /** 
     * Gets an item from local storage and wraps it in a proxy object.
     * This item is then placed in the cache and returned.
     * Returns undefined if the item does not exist in local storage.
     */
    async #getLocalStorage(key: string): Promise<object | undefined> {
        const item = await browser.storage.local.get(key);
        if (typeof item !== "object" || typeof item !== "undefined") {
            throw new Error("When getting item from local storage got something that was not an object or undefined");
        }
        Object.assign(Storage.#cache, item);
        return item;
    }


    /** 
     * Adds items to local storage and cache. 
     * This should only be used to set brand new objects ie. not in the cache or local storage.
     * Throws an error if items are already in cache as an object.
     */
    add(items: Record<string, object>): void {

        // We do these in separate loops so we don't get part way through and throw an error.
        // That would mean we would have to remove the items we already added to the cache. (pain in the butt)

        // check for duplicates in cache.
        for (const key in items) {
            if (Storage.#cache[key] !== undefined) throw new Error(`Item with key "${key}" is already in cache.`);
        }

        // add items to cache and local storage
        for (const [key, value] of Object.entries(items)) {
            Storage.#cache[key] = jsonCopy(value);
            sendMessage("storage", "add", { key, value });
        }
        // not async/await because we don't care how long it takes.
        browser.storage.local.set(items).catch((e) => console.error(e));
    }


    /** 
     * Delete items from cache and local storage.
     * Passing keys that are not in cach or local storage does not matter.
     */
    delete(keys: string[]): void {
        for (const key of keys) {
            delete Storage.#cache[key];
            sendMessage("storage", "delete", key);
        }

        // not async/await because we don't care how long it takes.
        browser.storage.local.remove(keys).catch((e) => console.error(e));
    }



    startListening() {
        const onUpdate = this.#update.bind(this);
        browser.runtime.onMessage.addListener(onUpdate);
        return () => browser.runtime.onMessage.removeListener(onUpdate);
    }


    /** 
     * Updates the values of items in cache.
     * Passing keys that are not in cache does nothing.
     */
    #update(message: Message): void {

        if (message.target !== "storage") return;



        switch(message.id) {

            case "modify": {
                const data = message.data as Data<"storage", "modify">;
                if (!Object.hasOwn(Storage.#cache, data.key)) break;
                
                // this is safe because the only time update("modify") is called is off a proxy object with itself as the value. /hopefully/
                Object.assign(Storage.#cache[data.key] as object, data.value);
                
                break;
            }

            case "delete":{
                const data = message.data as Data<"storage", "delete">;
                if (!Object.hasOwn(Storage.#cache, data)) break;
                delete Storage.#cache[data];
            }

            case "add": {
                const data = message.data as Data<"storage", "add">;
                if (Object.hasOwn(Storage.#cache, data.key)) {
                    throw new Error(`When updating storage with 'add', key "${data.key}" already existed in cache.`);
                }

                Storage.#cache[data.key] = jsonCopy(data.value);
            }
                
        }
        
    }


    /** 
     * Makes a proxy object that will update the local storage when a property is changed.
     */
    #makeProxy<T extends object>(key: string, obj: T): T {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                browser.storage.local.set({ [key]: target }).catch((e) => console.error(e));
                sendMessage("storage", "modify", { key, value: target });
                return true;
            }
        })
    }


    

}