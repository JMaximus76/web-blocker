import browser from 'webextension-polyfill';






export default class Storage {


    #cache: Record<string, object> = {}

    async get(keys: string[]): Promise<Record<string, object>> {
        //const items: Record<string, object> = keys.reduce((acc, key) => Object.assign(acc, {[key]: this.#cache[key]}), {});
        const items: Record<string, object> = {};
        for (const key of keys) {
            items[key] = this.#cache[key];
        }

        for (const key in items) {
            if (items[key] === undefined) {
                Object.assign(items, await browser.storage.local.get(key))
            }
        }
        Object.assign(this.#cache, items);

        const proxys: Record<string, object> = {};
        for (const key in items) {
            proxys[key] = this.#makeProxy(items[key], key);
        }

        return proxys;
    }


    async set(items: Record<string, object>): Promise<void> {
        Object.assign(this.#cache, items);
        await browser.storage.local.set(items);
    }


    #makeProxy<T extends object>(obj: T, key: string): T {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                browser.storage.local.set({ [key]: target });
                return true;
            }
        })
    }

}