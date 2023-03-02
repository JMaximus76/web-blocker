import type { Subscriber } from "svelte/store";
import browser from "webextension-polyfill";
import Info from "./info";
import { getStorageItem, setStorageItem } from "./storage";
import type { StorageInfo, Mode, UpdateMessageMap, StorageInfoList } from "./types";



export default class InfoList {
    #updateSent: boolean = false;

    #activeMode: Mode;
    #useSchedule: boolean;

    #infos: Record<string, Info>;

    #set: Subscriber<InfoList> | undefined = undefined;

    readonly #infoRefs = Info.getRefFunctions(this);

    

    constructor() {
        this.#activeMode = "block";
        this.#useSchedule = false;

        this.#infos = {};
    }


    get storage(): StorageInfoList {
        return {
            activeMode: this.#activeMode,
            useSchedule: this.#useSchedule,
            infos: Object.values(this.#infos).map((info) => info.storage),
        };
    }

    set storage(storage: StorageInfoList) {
        this.#activeMode = storage.activeMode;
        this.#useSchedule = storage.useSchedule;

        const infos: Record<string, Info> = {};
        storage.infos.map( info => new Info(info, this.#infoRefs) ).forEach( info => infos[info.id] = info );
        this.#infos = infos;
    }

    async syncFromStorage(): Promise<void> {
        const storage = await getStorageItem("infoList");
        this.storage = storage;
    }


    set svelteSet(set: Subscriber<InfoList> | undefined ) {
        this.#set = set;
    }
    

    save<T extends keyof UpdateMessageMap>(id: T, item: UpdateMessageMap[T]): void {
        console.log(`Save was called with id: ${id}`);
        console.table(item);
        this.#updateSent = true;

        if (this.#set !== undefined) this.#set(this);

        setStorageItem("infoList", this.storage)
            .then(() => browser.runtime.sendMessage({ id: id, item: item }).catch(() => console.log("failed to send update message")))
            .catch((e) => console.error(new Error(e)));
    }


    //this is for the svelte stores. If there are two instances of InfoList (the settings and popup) then when one calls save() the
    //message will be received by the svelte store and its will then call receiveUpdate() on its copy of InfoList. This *should* keep
    //both copies in sync. Key word *should*
    receiveUpdate<T extends keyof UpdateMessageMap>({id, item}: {id: T, item: UpdateMessageMap[T]} ): void {
        if (this.#updateSent) {
            console.log("Update received from self");
            this.#updateSent = false;
            return;
        }

        switch (id) {

            case "info":
                const storageInfo = item as UpdateMessageMap["info"];
                const info = this.getInfo(storageInfo.name, storageInfo.mode);
                if (info) {
                    info.locked = storageInfo.locked;
                    info.active = storageInfo.active;
                    info.useTimer = storageInfo.useTimer;
                } else {
                    console.error(new Error("receiveUpdate() was tyring to update an info but the message it received did not point to a valid info"));
                }
                break;

            case "infos":
                const storageInfos = item as UpdateMessageMap["infos"];
                const infos: Record<string, Info> = {};
                storageInfos.map( info => new Info(info, this.#infoRefs) ).forEach( info => infos[info.id] = info );
                this.#infos = infos;
                break;

            case "activeMode":
                this.#activeMode = item as UpdateMessageMap["activeMode"];
                break;

            case "useSchedule":
                this.#useSchedule = item as UpdateMessageMap["useSchedule"];
                break;
        }
    }

    




    checkInfo(id: string): boolean {
        return this.#infos[id] !== undefined;
    }



    modifyInfo(oldId: string, {name, mode}: {name: string, mode: Mode}): void {
        if (!this.checkInfo(oldId)) throw new Error(`Info with id '${oldId}' does not exist`);
        const newId = `${mode}-${name}`;
        if (this.checkInfo(newId)) throw new Error(`Info with id '${newId}' already exists`);


        this.#infos[newId] = this.#infos[oldId];
        delete this.#infos[oldId];
    }

    getInfo(name: string, mode: Mode): Info | undefined {
        return this.#infos[`${mode}-${name}`];
    }




    async registerNewList(name: string, mode: Mode): Promise<Info> {
        if (this.getInfo(name, mode)) throw new Error(`Info with name '${name}' and mode '${mode}' already exists`);

        const info = new Info({ name: name, mode: mode, active: false, locked: false, useTimer: false }, this.#infoRefs);
        await info.init();
        
        this.#infos[info.id] = info;
        this.save("infos", this.storage.infos);
        return info;
    }


    removeList(id: string): void {
        if (!this.checkInfo(id)) throw new Error(`Info with id '${id}' does not exist`);

        this.#infos[id].deleteObjects();
        delete this.#infos[id];
    }



    


    get activeMode(): Mode {
        return this.#activeMode;
    }
    toggleActiveMode(): void {
        this.#activeMode = (this.#activeMode === "block") ? "allow" : "block";
        this.save("activeMode", this.#activeMode);
    }

    get useSchedule(): boolean {
        return this.#useSchedule;
    }
    toggleUseSchedule(): void {
        this.#useSchedule = !this.#useSchedule;
        this.save("useSchedule", this.#useSchedule);
    }

    get block(): Info[] {
        return Object.values(this.#infos).filter( info => info.mode === "block" );
    }
    get allow(): StorageInfo[] {
        return Object.values(this.#infos).filter(info => info.mode === "allow");
    }

    get activeInfos(): Info[] {
        return Object.values(this.#infos).filter(info => info.active && (info.mode === this.#activeMode));
    }




    static init(): Promise<void> {
        const infoList = new InfoList();
        return setStorageItem("infoList", infoList.storage);
    }


}