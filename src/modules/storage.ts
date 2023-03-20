import browser from 'webextension-polyfill';






export default class Storage {


    #cache: Record<string, object> = {}

    /** Gets keys from cache or local storage.
     *  If key does not exist in either location it throws an error.
    */
    async get(keys: string[]): Promise<Record<string, object | undefined>> {

        // gets all items from cache, some of them might be undefined so we get those from local storage
        const items: Record<string, object> = {};
        for (const key of keys) {
            items[key] = this.#cache[key] ?? await this.#getLocalStorage(key);
        }
        return items;
    }


    /** Sets items in local storage and cache. 
     *  This should only be used to set brand new objects ie. they not in the cache or local storage.
     *  Throws an error if items are already in cache.
     */
    add(items: Record<string, object>): void {

        // We do these in separate loops so we don't get part way through and throw an error.
        // That would mean we would have to remove the items we already added to the cache. (pain in the butt)

        // check for duplicates in cache.
        for (const key in items) {
            if (this.#cache[key]) throw new Error(`Item with key "${key}" is already in cache.`);
        }

        // add items to cache and local storage
        for (const [key, value] of Object.entries(items)) {
            this.#cache[key] = this.#makeProxy(key, value);
        }
        browser.storage.local.set(items).catch((e) => console.error(e));
    }


    /** Delete items from cache and local storage.
     *  Passing keys that are not in cach or local storage does not matter.
     */
    delete(keys: string[]): void {
        for (const key of keys) {
            delete this.#cache[key];
        }
        browser.storage.local.remove(keys).catch((e) => console.error(e));
    }



    /** Updates the values of items in cache.
     *  Passing keys that are not in cache does nothing.
     */
    update(items: Record<string, object>): void {
        for (const [key, value] of Object.entries(items)) {
            if (this.#cache[key] !== undefined) Object.assign(this.#cache[key], value);
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
        if (item[key] === undefined) return undefined;
        const proxy = this.#makeProxy(key, item[key]);
        Object.assign(this.#cache, { [key]: proxy});
        return proxy;
    }

}