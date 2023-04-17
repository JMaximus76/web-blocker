import browser from 'webextension-polyfill';
import { jsonCopy, sendMessage, type Data, type Id, type Message } from './util';




export default class Storage {


    #cache: Record<string, object> = {};

    

    /**
     * Gets a key from local storage and adds it to the cache.
     * @param key The key of the requested item
     * @returns The item ascociated with the key from local storage or undefined if it does not exist.
     */
    async #getLocalStorage(key: string): Promise<object | undefined> {
        const item = await browser.storage.local.get(key);
        if (item[key] !== undefined) {
            this.#cache[key] = this.#proxy(key, item[key]);
        };
        return this.#cache[key];
    }


    /**
     * Gets an array of keys from cache or local storage.
     * @param keys An array of keys to get from cache or local storage.
     * @returns An array of items ascociated with the keys from cache or local storage. Entrys are undefined if they don't exist.
     */
    async getKeys<T extends object>(keys: string[]): Promise<(T | undefined)[]> {
        
        const items: (T | undefined)[] = [];
        
        for (const key of keys) {
            items.push(await this.getKey<T>(key));
        }
        
        return Promise.all(keys.map(async key => await this.getKey<T>(key)));
    }


    /**
     * Gets a key from cache or local storage.
     * @param key The key of the requested item.
     * @returns The item ascociated with the key from cache or local storage. Undefined if it does not exist.
     */
    async getKey<T extends object>(key: string): Promise<T | undefined> {

        if (Object.hasOwn(this.#cache, key)) {
            return this.#cache[key] as T;
        } else {
            return await this.#getLocalStorage(key) as T;
            
        }
    }


    


    /**
     * Adds new objects to cache and local storage. Will overwrite existing objects with the same key.
     * @param items The key value pairs to add to cache and local storage.
     */
    createNewItem(items: Record<string, object>): void {
        for (const [key, value] of Object.entries(items)) {
            this.#cache[key] = this.#proxy(key, jsonCopy(value));
        }
        browser.storage.local.set(items).catch((e) => console.error(e));
    }


    /**
     * Deletes key value pairs from cache and local storage.
     * @param keys An array of keys to delete from cache and local storage.
     */
    delete(keys: string[]): void {
        for (const key of keys) {
            delete this.#cache[key];
        }
        browser.storage.local.remove(keys).catch((e) => console.error(e));
    }




    startListening() {
        const onMessage = (message: Message) => {
            if (message.target === "storage" && message.id as Id<"storage"> === "update") {
                
                const { key, value } = message.data as Data<"storage", "update">;
                
                if (Array.isArray(this.#cache[key])) (this.#cache[key] as any[]).length = 0;
                Object.assign(this.#cache[key], value);
                // I don't think this will update the ui because svelte won't know that the object has changed
                
            }
        };

        browser.runtime.onMessage.addListener(onMessage);
        return () => browser.runtime.onMessage.removeListener(onMessage);
    }

    



    // DOES NOT WORK
    // WILL SAVE ALL PROPERTIES OF THE PROXY TO LOCAL STORAGE
    #proxy(key: string, obj: Record<string, any>): object {
        const doUpdates = (target: object) => {
            browser.storage.local.set({ [key]: target }).catch((e) => console.error(e));
            sendMessage("storage", "update", { key, value: target });
            sendMessage("background", "update", null);
        }


        // recursively makes all objects in obj proxies
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === "object") {
                obj[key] = this.#proxy(key, value);
            }
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