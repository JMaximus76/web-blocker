import browser from 'webextension-polyfill';
import { jsonCopy, sendMessage, type Data, type Id, type Message } from './util';




// dont' think I'll need to seal the objects because typescript should make sure I don't 
// add any properties to them. And I also need to add props for the entry lists so... not sure.

export default class Storage {


    #cache: Record<string, object> = {};

    


    /** 
     * Gets keys from cache or local storage.
     * If key does not exist in either location it returns undefined.
    */
    async getKeys<T extends object>(keys: string[]): Promise<(T | undefined)[]> {
        // gets all items from cache, some of those might be undefined so we get those from local storage.
        // if its also undefined in local storage will return undefined for that key.
        const items: (object | undefined)[] = [];
        
        for (const key of keys) {
            const item = Object.hasOwn(this.#cache, key) ? this.#cache[key] : await this.#getLocalStorage(key);

            if (typeof item === "object") {
                items.push(this.#proxy(key, item));
            } else {
                items.push(item);
            }
            
        }
        return items as (T | undefined)[];
    }


    async getKey<T extends object>(key: string) {
        const item = Object.hasOwn(this.#cache, key) ? this.#cache[key] : await this.#getLocalStorage(key);
        if (typeof item === "object") {
            return this.#proxy(key, item) as T;
        } else {
            return item;
        }
    }


    /** 
     * Gets an item from local storage, places it in the cache and returns it.
     * Returns undefined if the item does not exist in local storage.
     */
    async #getLocalStorage(key: string): Promise<object | undefined> {
        const item = await browser.storage.local.get(key);
        if (item[key] !== undefined) Object.assign(this.#cache, item);
        return item[key];
    }


    /** 
     * Adds items to local storage and cache. 
     * This should only be used to set brand new objects ie. not in the cache or local storage.
     */
    add(items: Record<string, object>): void {
        for (const [key, value] of Object.entries(items)) {
            this.#cache[key] = jsonCopy(value);
        }
        browser.storage.local.set(items).catch((e) => console.error(e));
    }


    /** 
     * Delete items from cache and local storage.
     * Passing keys that are not in cach or local storage does not matter.
     */
    delete(keys: string[]): void {
        for (const key of keys) {
            delete this.#cache[key];
        }
        browser.storage.local.remove(keys).catch((e) => console.error(e));
    }


    startListening() {
        const onMessage = (message: Message) => {
            if (message.target === "storage") {
                if (message.id as Id<"storage"> === "update") {
                    const { key, value } = message.data as Data<"storage", "update">;
                    if (this.#cache[key] === undefined) return;
                    if (Array.isArray(this.#cache[key])) (this.#cache[key] as any[]).length = 0;
                    Object.assign(this.#cache[key], value);
                    // I don't think this will update the ui because the proxy won't know
                }
            }
        };

        browser.runtime.onMessage.addListener(onMessage);
        return () => browser.runtime.onMessage.removeListener(onMessage);
    }

    




    #proxy<T extends object>(key: string, obj: T): T {
        const doUpdates = (target: T) => {


            browser.storage.local.set({ [key]: target }).catch((e) => console.error(e));
            sendMessage("storage", "update", { key, value: target });
            sendMessage("background", "update", null);

        }

        if (Array.isArray(obj)) {

            return new Proxy(obj, {
                set: (target, prop, value) => {
                    Reflect.set(target, prop, value);
                    if (prop === "length") doUpdates(target);
                    return true;
                }
            });

        } else {

            return new Proxy(obj, {
                set: (target, prop, value) => {
                    Reflect.set(target, prop, value);
                    doUpdates(target);
                    return true;
                }
            });
            
        }
    }


    

}