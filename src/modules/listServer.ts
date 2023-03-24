import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';
import { buildList, type EntryList, type Info, type Mode, type Timer } from "./listComponets";
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



    /** 
     * The svelte seter for keeping in sync with ui 
     */
    startListening() {
        return this.#storage.startListening();
    }
    

    /** 
     * Syncs the internal record to the one in local storage.
     */
    async sync(): Promise<void> {
        const item = await this.#storage.getKey<ListRecord>("record");
        if (item === undefined) throw new Error("When syncing a listServer got undefined for the record");
        this.#record = item;
    }

    
    async biuldListFromStorage(id: string) {
        const info = await this.#storage.getKey<Info>(ListServer.infoId(id));
        if (info === undefined) throw new Error("ListServer: When building list from storage got undefiend info");

        const entrys = await this.#storage.getKey<EntryList>(ListServer.entryListId(id));
        if (entrys === undefined) throw new Error("ListServer: When building list from storage got undefiend entrys");

        const timer = await this.#storage.getKey<Timer>(ListServer.timerId(id));
        if (timer === undefined) throw new Error("ListServer: When building list from storage got undefiend timer");


        return buildList(info, entrys, timer);
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
            [ListServer.entryListId(id)]: entrys,
            [ListServer.timerId(id)]: timer
        });

        return id;
    }

    /** 
     * Deletes a list and all of its components 
     */
    deleteList(id: string): void {
        this.#record.splice(this.#record.indexOf(id), 1);
        this.#storage.delete([ListServer.infoId(id), ListServer.entryListId(id), ListServer.timerId(id)]);
    }


    /**
     * Takes a set of filter parameters and returns a list of all matching infos.
     */
    async #infoFilter({active, mode, useTimer}: { active?: boolean, mode?: Mode, useTimer?: boolean }): Promise<Info[]> {
        const items = await this.#storage.getKeys<Info>(this.#record.map((id) => ListServer.infoId(id)));
        
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
        const entryControler = new EntryControler();

        const filtered: Info[] = [];

        for (const info of infos) {
            const entryList = await this.#storage.getKey<EntryList>(ListServer.entryListId(info.id));
            if (entryList === undefined) throw new Error("listServer got undefined when filtering entrys");
            entryControler.setList(entryList);
            if (entryControler.check(url)) filtered.push(info);
        }

        return filtered;
    }

    /**
     * Takes a list component type and a set of filter parameters and returns a list of all matching components.
     */
    async request<T extends keyof RequestMap>(type: T, details: { match?: string, active?: boolean, mode?: Mode, useTimer?: boolean }): Promise<Array<RequestMap[T]>> {
        let infos = await this.#infoFilter(details);
        if (details.match !== undefined) {
            infos = await this.#entrysFilter(details.match, infos);
        }
        const items = await this.#storage.getKeys<RequestMap[T]>(infos.map((info) => this.#requestId(type, info.id)));
        return items.map((o) => {
            if (o === undefined) throw new Error(`listServer got undefined when getting ${type}`);
            return o;
        });
    }



    /** 
     * Gets the requested id.
     */
    async getId<T extends keyof RequestMap>(type: T, id: string): Promise<RequestMap[T]> {
        id = this.#requestId(type, id);
        const item = await this.#storage.getKey<RequestMap[T]>(id);
        if (item === undefined) throw new Error(`listServer got undefined when getting id ${id}`);
        return item;
    }

    /**
     * Gets the requested ids.
     */
    async getIds<T extends keyof RequestMap>(type: T, ids: string[]): Promise<Array<RequestMap[T]>> {
        ids = ids.map((id) => this.#requestId(type, id));

        const items = await this.#storage.getKeys<RequestMap[T]>(ids);
        return items.map((o) => {
            if (o === undefined) throw new Error(`listServer got undefined when getting id ${ids}`);
            return o;
        });
    }


    static infoId(id: string): string {
        return `info-${id}`;
    }

    static entryListId(id: string): string {
        return `list-${id}`;
    }

    static timerId(id: string): string {
        return `timer-${id}`;
    }


    #requestId<T extends keyof RequestMap>(type: T, id: string): string {
        switch(type) {
            case "info": return ListServer.infoId(id);
            case "entrys": return ListServer.entryListId(id);
            case "timer": return ListServer.timerId(id);
            default: throw new Error("listServer got invalid request type");
        }
    }

}