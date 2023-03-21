import browser from 'webextension-polyfill';
import { jsonCopy, sendMessage } from './util';


export type UpdateMap = {
    "modify": { key: string; value: object };
    "delete": { key: string };
    "add": { key: string; value: object };
}

export type MessageMap = {
    ""
}

export default class Storage {


    #cache: Record<string, object | undefined> = {}

    /** Gets keys from cache or local storage.
     *  If key does not exist in either location it throws an error.
    */
    async get<T extends object>(keys: string | string[]): Promise<(T | undefined)[]> {
        if (typeof keys === "string") keys = [keys];

        // gets all items from cache, some of those might be undefined so we get those from local storage.
        // if its also undefined in local storage will return undefined for that key.
        const items: (object | undefined)[] = [];
        for (const key of keys) {
            const item = Object.hasOwn(this.#cache, key) ? this.#cache[key] : await this.#getLocalStorage(key);

            if (typeof item === "object") {
                items.push(this.#makeProxy(key, item));
            } else {
                items.push(item);
            }
            
        }
        return items as (T | undefined)[];
    }


    /** Adds items to local storage and cache. 
     *  This should only be used to set brand new objects ie. they not in the cache or local storage.
     *  Throws an error if items are already in cache as an object.
     */
    add(items: Record<string, object>): void {

        // We do these in separate loops so we don't get part way through and throw an error.
        // That would mean we would have to remove the items we already added to the cache. (pain in the butt)

        // check for duplicates in cache.
        for (const key in items) {
            if (this.#cache[key] !== undefined) throw new Error(`Item with key "${key}" is already in cache.`);
        }

        // add items to cache and local storage
        for (const [key, value] of Object.entries(items)) {
            this.#cache[key] = jsonCopy(value);
            sendMessage<keyof UpdateMap>({for: "uiSync", id: "add", item: value});
        }
        // not async/await because we don't care how long it takes.
        browser.storage.local.set(items).catch((e) => console.error(e));
    }


    /** Delete items from cache and local storage.
     *  Passing keys that are not in cach or local storage does not matter.
     */
    delete(keys: string[]): void {
        for (const key of keys) {
            delete this.#cache[key];
            sendMessage<keyof UpdateMap>({for: "uiSync", id: "delete", value: })
        }

        // not async/await because we don't care how long it takes.
        browser.storage.local.remove(keys).catch((e) => console.error(e));
    }



    /** Updates the values of items in cache.
     *  Passing keys that are not in cache does nothing.
     */
    #update<T extends keyof UpdateMap>(code: T, item: UpdateMap[T]): void {


        switch(code) {

            case "modify": {
                const {key, value} = item as UpdateMap["modify"];
                if (!Object.hasOwn(this.#cache, key)) break;
                
                // this is safe because the only time update("modify") is called is off a proxy object with itself as the value. /hopefully/
                Object.assign(this.#cache[key] as object, value);
                
                break;
            }

            case "delete":{
                const {key} = item as UpdateMap["delete"];
                if (!Object.hasOwn(this.#cache, key)) break;

                delete this.#cache[key];
            }

            case "add": {
                const {key, value} = item as UpdateMap["add"];
                if (Object.hasOwn(this.#cache, key)) {
                    throw new Error(`When updateing storage with 'add' code, key "${key}" already existed in cache.`);
                }

                this.#cache[key] = jsonCopy(value);
            }
                
        }
        
    }


    /** Makes a proxy object that will update the local storage when a property is changed. */
    #makeProxy<T extends object>(key: string, obj: T): T {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                browser.storage.local.set({ [key]: target }).catch((e) => console.error(e));
                return true;
            }
        })
    }


    /** Gets an item from local storage and wraps it in a proxy object.
     *  This item is then placed in the cache and returned.
     *  Returns undefined if the item does not exist in local storage.
     */
    async #getLocalStorage(key: string): Promise<object | undefined> {
        const item = await browser.storage.local.get(key);
        if (typeof item !== "object" || typeof item !== "undefined") {
            throw new Error("When getting item from local storage got something that was not an object or undefined");
        }
        Object.assign(this.#cache, item);
        return item;
    }

}