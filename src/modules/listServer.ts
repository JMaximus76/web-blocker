import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';
import { buildList, type EntryList, type Info, type List, type Mode, type Timer } from "./listComponets";
import browser from "webextension-polyfill";
import EntryControler from "./entryControler";



type ListRecord = string[];

type RequestMap = {
    info: Info;
    entrys: EntryList;
    timer: Timer;
}

export type SvelteEdit = {
    add: (id: string, list: Promise<List>) => void;
    delete: (id: string) => void;
    modify: () => void;
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
    #svelte: SvelteEdit | null = null;


    /** 
     * The svelte seter for keeping in sync with ui 
     */
    startListening(s: SvelteEdit) {
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

    
    static async biuldListFromStorage(id: string, storage: Storage) {
        const info = await storage.get<Info>(ListServer.infoId(id));
        if (info[0] === undefined) throw new Error("ListServer: When building list from storage got undefiend info");

        const entrys = await storage.get<EntryList>(ListServer.entrysId(id));
        if (entrys[0] === undefined) throw new Error("ListServer: When building list from storage got undefiend entrys");

        const timer = await storage.get<Timer>(ListServer.timerId(id));
        if (timer[0] === undefined) throw new Error("ListServer: When building list from storage got undefiend timer");


        return buildList(info[0], entrys[0], timer[0]);
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
            [ListServer.infoId(id)]: info,
            [ListServer.entrysId(id)]: entrys,
            [ListServer.timerId(id)]: timer
        });

        if (this.#svelte !== null) {
            this.#svelte.add(id, ListServer.biuldListFromStorage(id, this.#storage));
        }

        return id;
    }

    /** 
     * Deletes a list and all of its components 
     */
    deleteList(id: string): void {
        this.#record = this.#record.filter((i) => i !== id);
        this.#storage.delete([ListServer.infoId(id), ListServer.entrysId(id), ListServer.timerId(id)]);
        if (this.#svelte !== null) this.#svelte.delete(id);
    }


    /**
     * Takes a set of filter parameters and returns a list of all matching infos.
     */
    async #infoFilter({active, mode, useTimer}: { active?: boolean, mode?: Mode, useTimer?: boolean }): Promise<Info[]> {
        const items = await this.#storage.get<Info>(this.#record.map((id) => ListServer.infoId(id)));
        
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
            const item = (await this.#storage.get<EntryList>(ListServer.entrysId(info.id)))[0];
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
            if (this.#svelte !== null) return this.#svelteProxy(o, this.#svelte.modify);
            return o;
        });
    }



    /** 
     * Gets the requested id.
     */
    async getId<T extends keyof RequestMap>(type: T, id: string): Promise<RequestMap[T]> {
        id = this.#requestId(type, id);
        const item = await this.#storage.get<RequestMap[T]>(id);
        if (item[0] === undefined) throw new Error(`listServer got undefined when getting id ${id}`);

        if (this.#svelte !== null) return this.#svelteProxy(item[0], this.#svelte.modify);
        return item[0];
    }

    /**
     * Gets the requested ids.
     */
    async getIds<T extends keyof RequestMap>(type: T, ids: string[]): Promise<Array<RequestMap[T]>> {
        ids = ids.map((id) => this.#requestId(type, id));

        const items = await this.#storage.get<RequestMap[T]>(ids);
        return items.map((o) => {
            if (o === undefined) throw new Error(`listServer got undefined when getting id ${ids}`);
            if (this.#svelte !== null) return this.#svelteProxy(o, this.#svelte.modify);
            return o;
        });
    }


    // async testbyIds<T extends keyof RequestMap, U extends string | string[]>(type: T, ids: U): Promise<U extends string[] ? RequestMap[T][] : RequestMap[T]> {
    //     if (Array.isArray(ids)) {
    //         const test = ids;
    //     }
    // }



    

    /** 
     * Wraps outgoing objects in a svelte proxy if this.#svelte is set.
     * Sets a "set" trap that updates the ui.
     */
    #svelteProxy<T extends object>(obj: T, set: () => void) {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                set();
                return true;
            }
        });
    }



    static infoId(id: string): string {
        return `info-${id}`;
    }

    static entrysId(id: string): string {
        return `list-${id}`;
    }

    static timerId(id: string): string {
        return `timer-${id}`;
    }


    #requestId<T extends keyof RequestMap>(type: T, id: string): string {
        switch(type) {
            case "info": return ListServer.infoId(id);
            case "entrys": return ListServer.entrysId(id);
            case "timer": return ListServer.timerId(id);
            default: throw new Error("listServer got invalid request type");
        }
    }

}