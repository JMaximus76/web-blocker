import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';
import type { Subscriber } from "svelte/store";
import type { EntryList, Info, Mode, Timer } from "./listComponets";
import browser from "webextension-polyfill";
import EntryControler from "./entryControler";



type ListRecord = string[];

type RequestMap = {
    info: Info;
    entrys: EntryList;
    timer: Timer;
}

export default class ListServer {

    /** Sets a new "ListRecord" into local storage.
     *  ONLY all this on extension install.
     */
    static async init() {
        await browser.storage.local.set({record: []});
    }


    #storage = new Storage();
    

    #record: ListRecord = [];
    #svelte: Subscriber<ListServer> | null = null;


    /** 
     * The svelte seter for keeping in sync with ui 
     */
    startListening(s: Subscriber<ListServer>) {
        this.#svelte = s;
        return this.#storage.startListening();
    }
    

    /** 
     * Syncs the internal record to the one in local storage.
     */
    async sync(): Promise<void> {
        // should change this probably
        const item = await this.#storage.get<ListRecord>("record");
        if (item[0] === undefined) throw new Error("When syncing a listServer got undefined for the record");
        this.#record = item[0];
    }

    




    /** 
     * Registers a new list and all of its components. 
     */
    registerList(details: Partial<Omit<Info, "id">> & {maxInMin?: number} = {}, ): string {
        const id = uuidv4();

        this.#record.push(id);

        const info: Info = {
            name: details.name ?? "New List",
            mode: details.mode ?? "block",
            id: id,
            active: details.active ?? true,
            locked: details.locked ?? false,
            useTimer: details.useTimer ?? false
        }

        const entrys: EntryList = [];

        const timer: Timer = {
            total: 0,
            max: (details.maxInMin ?? 0) * 60000,
            start: null,
            id: id
        }


        this.#storage.add({
            [this.#infoId(id)]: info,
            [this.#entrysId(id)]: entrys,
            [this.#timerId(id)]: timer
        });

        return id;
    }

    /** 
     * Deletes a list and all of its components 
     */
    deleteList(id: string): void {
        this.#record = this.#record.filter((i) => i !== id);
        this.#storage.delete([this.#infoId(id), this.#entrysId(id), this.#timerId(id)]);
    }


    /**
     * Takes a set of filter parameters and returns a list of all matching infos.
     */
    async #infoFilter({active, mode, useTimer}: { active?: boolean, mode?: Mode, useTimer?: boolean }): Promise<Info[]> {
        const items = await this.#storage.get<Info>(this.#record.map((id) => this.#infoId(id)));
        
        return items.filter((item) => {
            if (item === undefined) throw new Error("listServer got undefined when filtering infos");
            if (active !== undefined && item.active !== active) return false;
            if (mode !== undefined && item.mode !== mode) return false;
            if (useTimer !== undefined && item.useTimer !== useTimer) return false;
            return true;
        }) as Info[];
    }


    /**
     * Takes a url and a list of infos and returns a list of all infos that have a list that matches the url.
     */
    async #entrysFilter(url: string, infos: Info[]) {
        return infos.filter(async (info) => {
            const item = (await this.#storage.get<EntryList>(this.#entrysId(info.id)))[0];
            if (item === undefined) throw new Error("listServer got undefined when filtering entrys");
            const entryList = new EntryControler(item, true);
            return entryList.check(url);
        });

    }

    /**
     * Takes a list component type and a set of filter parameters and returns a list of all matching components.
     */
    async request<T extends keyof RequestMap>(type: T, details: { match?: string, active?: boolean, mode?: Mode, useTimer?: boolean }): Promise<Array<RequestMap[T]>> {
        let infos = await this.#infoFilter(details);
        if (details.match !== undefined) {
            infos = await this.#entrysFilter(details.match, infos);
        }
        const items = await this.#storage.get<RequestMap[T]>(infos.map((info) => this.#requestId(type, info.id)));
        return items.map((o) => {
            if (o === undefined) throw new Error(`listServer got undefined when getting ${type}`);
            if (this.#svelte !== null) return this.#svelteProxy(o, this, this.#svelte);
            return o;
        });
    }



    /** 
     * Gets the requested id.
     */
    async byId<T extends keyof RequestMap>(type: T, id: string): Promise<RequestMap[T]> {
        id = this.#requestId(type, id);
        const item = await this.#storage.get<RequestMap[T]>(id);
        if (item[0] === undefined) throw new Error(`listServer got undefined when getting id ${id}`);

        if (this.#svelte !== null) return this.#svelteProxy(item[0], this, this.#svelte);
        return item[0];
    }

    /**
     * Gets the requested ids.
     */
    async byIds<T extends keyof RequestMap>(type: T, ids: string[]): Promise<Array<RequestMap[T]>> {
        ids = ids.map((id) => this.#requestId(type, id));

        const items = await this.#storage.get<RequestMap[T]>(ids);
        return items.map((o) => {
            if (o === undefined) throw new Error(`listServer got undefined when getting id ${ids}`);
            if (this.#svelte !== null) return this.#svelteProxy(o, this, this.#svelte);
            return o;
        });
    }   


    /** 
     * Wraps outgoing objects in a svelte proxy if this.#svelte is set.
     * Sets a "set" trap that updates the ui.
     */
    #svelteProxy<T extends object>(obj: T, ref: ListServer, set: Subscriber<ListServer>) {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                set(ref);
                return true;
            }
        });
    }



    #infoId(id: string): string {
        return `info-${id}`;
    }

    #entrysId(id: string): string {
        return `list-${id}`;
    }

    #timerId(id: string): string {
        return `timer-${id}`;
    }


    #requestId<T extends keyof RequestMap>(type: T, id: string): string {
        switch(type) {
            case "info": return this.#infoId(id);
            case "entrys": return this.#entrysId(id);
            case "timer": return this.#timerId(id);
            default: throw new Error("listServer got invalid request type");
        }
    }

}