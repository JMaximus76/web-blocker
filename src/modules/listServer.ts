import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';
import { type Entries, type Info, type Mode, type Timer, type List } from "./listComponets";
import browser from "webextension-polyfill";
import EntriesWrapper from "./wrappers/entriesWrapper";
import TimerWrapper from "./wrappers/timerWrapper";
//import { conform, isOf } from "./util";
import WrapperFactory from "./wrappers/wrapperFactory";



type ListRecord = string[];

type RequestMap = {
    info: Info;
    entries: EntriesWrapper;
    timer: TimerWrapper;
};

type Request = {
    match?: string;
    activeTimer?: boolean;
    active?: boolean;
    mode?: Mode;
    useTimer?: boolean;
};

// type CheckMap = {
//     [key in keyof Required<Request>]: (info: Info) => boolean;
// }




export default class ListServer {

    /** 
     * Sets a new "ListRecord" into local storage.
     * ONLY use this on extension install.
     */
    static async init() {
        await browser.storage.local.set({listRecord: []});
    }


    #storage = new Storage();
    #record: ListRecord = [];

    #entriesFactory = new WrapperFactory<Entries, EntriesWrapper>(entries => new EntriesWrapper(entries));
    #timerFactory = new WrapperFactory<Timer, TimerWrapper>(timer => new TimerWrapper(timer));


    startListening() {
        return this.#storage.startListening();
    }
    

    /** 
     * Syncs the internal list record to the one in local storage.
     */
    async sync(): Promise<void> {
        const item = await this.#storage.getKey<ListRecord>("listRecord");
        if (item === undefined) throw new Error("When syncing a listServer got undefined for the record");
        this.#record = item;
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

        const entries: Entries = [];

        const timer: Timer = {
            total: 0,
            max: (details.maxInMin ?? 0) * 60000,
            start: null,
            id: id
        }


        this.#storage.createNew({
            [ListServer.infoId(id)]: info,
            [ListServer.entriesId(id)]: entries,
            [ListServer.timerId(id)]: timer
        });

        return id;
    }

    /** 
     * Deletes a list and all of its components 
     */
    deleteList(id: string): void {
        this.#record.splice(this.#record.indexOf(id), 1);
        this.#storage.delete([ListServer.infoId(id), ListServer.entriesId(id), ListServer.timerId(id)]);
    }



    /**
     * Takes a url and an info the returns true if the url matches on the infos entryList.
     */
    async #entriesFilter(url: string, {id}: Info): Promise<boolean> {
        return (await this.getId("entries", id)).check(url);   
    }


    async #timerFilter({mode, id}: Info): Promise<boolean> {
        return (mode === "block") === (await this.getId("timer", id)).done;
    }

    /**
     * Takes a list component type and a set of filter parameters and returns a list of all matching components.
     * 
     */
    async request<T extends keyof RequestMap>(type: T, { match, activeTimer, active, mode, useTimer }: Request): Promise<Array<RequestMap[T]>> {
        const infos = await this.getIds("info", this.#record);

        const filteredInfos: Info[] = [];

        // make a function builder to make a custom check functin for each call. Less loop time more memory
        for (const info of infos) {
            if (info === undefined) throw new Error("listServer got an undefined info when filtering");

            if (active !== undefined && info.active !== active) continue;
            if (mode !== undefined && info.mode !== mode) continue;
            if (useTimer !== undefined && info.useTimer !== useTimer) continue;

            if (info.useTimer && activeTimer !== undefined && activeTimer !== (await this.#timerFilter(info))) continue;
            if (match !== undefined && !(await this.#entriesFilter(match, info))) continue;

            filteredInfos.push(info);
        }


        


        if (type === "info") {
            return filteredInfos as Array<RequestMap[T]>;
        } else {
            return await this.getIds(type, filteredInfos.map((info) => info.id));
        }
    }



    /** 
     * Gets the requested id.
     */
    async getId<T extends keyof RequestMap>(type: T, id: string): Promise<RequestMap[T]> {
        id = this.#requestId(type, id);

        const item = await this.#storage.getKey(id);
        if (item === undefined) throw new Error(`listServer got undefined when getting id ${id}`);


        switch (type) {
            case "entries": return this.#entriesFactory.build(item as Entries) as RequestMap[T];
            case "timer": return this.#timerFactory.build(item as Timer) as RequestMap[T];
            case "info": return item as RequestMap[T];
            default: throw new Error("listServer got an invalid type");
        }
    }

    /**
     * Gets the requested ids.
     */
    async getIds<T extends keyof RequestMap>(type: T, ids: string[]): Promise<Array<RequestMap[T]>> {
        ids = ids.map((id) => this.#requestId(type, id));

        const items = await this.#storage.getKeys(ids);

        items.forEach((item) => {if (item === undefined) throw new Error(`listServer got undefined when getting id ${ids}`)});

        switch (type) {
            case "entries": return items.map((item) => this.#entriesFactory.build(item as Entries)) as Array<RequestMap[T]>;
            case "timer": return items.map((item) => this.#timerFactory.build(item as Timer)) as Array<RequestMap[T]>;
            case "info": return items as Array<RequestMap[T]>;
            default: throw new Error("listServer got an invalid type");
        }
    }


    static infoId(id: string): string {
        return `info-${id}`;
    }

    static entriesId(id: string): string {
        return `entries-${id}`;
    }

    static timerId(id: string): string {
        return `timer-${id}`;
    }


    #requestId<T extends keyof RequestMap>(type: T, id: string): string {
        switch(type) {
            case "info": return ListServer.infoId(id);
            case "entries": return ListServer.entriesId(id);
            case "timer": return ListServer.timerId(id);
            default: throw new Error("listServer got invalid request type");
        }
    }



    async buildListFromStorage(id: string): Promise<List> {
        return {
            info: await this.getId("info", id),
            entries: await this.getId("entries", id),
            timer: await this.getId("timer", id)
        }
    }

    async buildAllListsRecord(): Promise<Record<string, List>> {
        return Object.fromEntries(await Promise.all(this.#record.map(async (id) => [id, await this.buildListFromStorage(id)])));
    }

    



    // static validate(storage: Record<string, any>): Record<string, any> {

    //     const templateInfo: Info = {
    //         name: "New List",
    //         mode: "block",
    //         id: "",
    //         active: true,
    //         locked: false,
    //         useTimer: false
    //     };

    //     const templateTimer: Timer = {
    //         total: 0,
    //         max: 0,
    //         start: null,
    //         id: ""
    //     };

    //     const templateEntry: string[] = [
    //         "mode",
    //         "cliped",
    //         "original",
    //         "id"
    //     ];



    //     if (typeof storage.record !== "object" || storage.record === null || !Array.isArray(storage.record)) {
    //         storage.record = [];
    //     }



    //     const validLists: Record<string, any> = {
    //         record: storage.record
    //     };

    //     for (const id of storage.record) {

    //         templateInfo.id = id;
    //         templateTimer.id = id;

    //         const infoId = ListServer.infoId(id);
    //         const entriesId = ListServer.entriesId(id);
    //         const timerId = ListServer.timerId(id);

    //         const info: unknown = storage[infoId];
    //         const entries: unknown = storage[entriesId];
    //         const timer: unknown = storage[timerId];

    //         if (typeof info === "object" && info !== null) {
    //             conform(info, templateInfo);
    //             validLists[infoId] = info;
    //         } else {
    //             validLists[infoId] = templateInfo;
    //         }


    //         if (Array.isArray(entries)) {
    //             const newEntries: Entry[] = [];
    //             for (const entry of entries) {
    //                 if (isOf(entry, templateEntry)) {
    //                     newEntries.push(entry);
    //                 }
    //             }
    //             validLists[entriesId] = newEntries;
    //         } else {
    //             validLists[entriesId] = [];
    //         }

    //         if (typeof timer === "object" && timer !== null) {
    //             conform(timer, templateTimer);
    //             validLists[timerId] = timer;
    //         } else {
    //             validLists[timerId] = templateTimer;
    //         }
    //     }


    //     return validLists;
    // }

    

}