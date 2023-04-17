import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';
import { buildList, type Entry, type EntryList, type Info, type Mode, type Timer } from "./listComponets";
import browser from "webextension-polyfill";
import EntryController from "./controllers/entryController";
import TimerController from "./controllers/timerController";
import { conform, isOf } from "./util";



type ListRecord = string[];

type RequestMap = {
    info: Info;
    entrys: EntryList;
    timer: Timer;
};

type Request = {
    match?: string;
    activeTimer?: boolean;
    active?: boolean;
    mode?: Mode;
    useTimer?: boolean;
};




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

    // VERY inneficient, would need to re work the storage system to fix this
    async buildListFromStorage(id: string) {
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


        this.#storage.createNewItem({
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
     * Takes a url and an info the returns true if the url matches on the infos entryList.
     */
    async #entrysFilter(url: string, info: Info, entryController: EntryController): Promise<boolean> {
        
        const entryList = await this.#storage.getKey<EntryList>(ListServer.entryListId(info.id));
        if (entryList === undefined) throw new Error("listServer got undefined when filtering an entryList");
        entryController.list = entryList;
        return entryController.check(url);   
    }


    async #timerFilter(info: Info, timerController: TimerController): Promise<boolean> {
        const timer = await this.#storage.getKey<Timer>(ListServer.timerId(info.id));
        if (timer === undefined) throw new Error("listServer got undefined when filtering a timer");
        timerController.timer = timer;

        // works like an xor
        return (info.mode === "block") === timerController.done;
    }

    /**
     * Takes a list component type and a set of filter parameters and returns a list of all matching components.
     */
    async request<T extends keyof RequestMap>(type: T, { match, activeTimer, active, mode, useTimer }: Request): Promise<Array<RequestMap[T]>> {
        const infos = await this.#storage.getKeys<Info>(this.#record.map((id) => ListServer.infoId(id)));
        const filteredInfos: Info[] = [];

        const entryController = new EntryController();
        const timerController = new TimerController();

        for (const info of infos) {
            if (info === undefined) throw new Error("listServer got an undefined info when filtering");
            if (active !== undefined && info.active !== active) continue;
            if (mode !== undefined && info.mode !== mode) continue;
            if (useTimer !== undefined && info.useTimer !== useTimer) continue;
            if (info.useTimer && activeTimer !== undefined && activeTimer !== (await this.#timerFilter(info, timerController))) continue;
            if (match !== undefined && !(await this.#entrysFilter(match, info, entryController))) continue;
            filteredInfos.push(info);
        }

        if (type === "info") return filteredInfos as Array<RequestMap[T]>;

        const requestedItems = await this.#storage.getKeys<RequestMap[T]>(filteredInfos.map((info) => this.#requestId(type, info.id)));
        return requestedItems.map((o) => {
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




    static validate(storage: Record<string, any>): Record<string, any> {

        const templateInfo: Info = {
            name: "New List",
            mode: "block",
            id: "",
            active: true,
            locked: false,
            useTimer: false
        };

        const templateTimer: Timer = {
            total: 0,
            max: 0,
            start: null,
            id: ""
        };

        const templateEntry: string[] = [
            "mode",
            "cliped",
            "original",
            "id"
        ];



        if (typeof storage.record !== "object" || storage.record === null || !Array.isArray(storage.record)) {
            storage.record = [];
        }



        const validLists: Record<string, any> = {
            record: storage.record
        };

        for (const id of storage.record) {

            templateInfo.id = id;
            templateTimer.id = id;

            const infoId = ListServer.infoId(id);
            const entrysId = ListServer.entryListId(id);
            const timerId = ListServer.timerId(id);

            const info: unknown = storage[infoId];
            const entrys: unknown = storage[entrysId];
            const timer: unknown = storage[timerId];

            if (typeof info === "object" && info !== null) {
                conform(info, templateInfo);
                validLists[infoId] = info;
            } else {
                validLists[infoId] = templateInfo;
            }


            if (Array.isArray(entrys)) {
                const newEntrys: Entry[] = [];
                for (const entry of entrys) {
                    if (isOf(entry, templateEntry)) {
                        newEntrys.push(entry);
                    }
                }
                validLists[entrysId] = newEntrys;
            } else {
                validLists[entrysId] = [];
            }

            if (typeof timer === "object" && timer !== null) {
                conform(timer, templateTimer);
                validLists[timerId] = timer;
            } else {
                validLists[timerId] = templateTimer;
            }
        }


        return validLists;
    }

    

}