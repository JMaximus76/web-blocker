import type { Subscriber } from "svelte/store";
import browser from "webextension-polyfill";
import Info from "./info";
import { getStorageItem, setStorageItem } from "./storage";
import type { StorageInfo, Mode, UpdateMessageMap, StorageInfoList } from "./types";



export default class InfoList {


    #activeMode: Mode;
    #useSchedule: boolean;
    #infos: Record<string, Info>;

    #set: Subscriber<InfoList> | undefined = undefined;
    

    

    constructor() {
        this.#activeMode = "block";
        this.#useSchedule = false;
        this.#infos = {};
    }


    static async init(): Promise<void> {
        const infoList = new InfoList();
        await setStorageItem("infoList", infoList.storage);
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

        const infoSave = Info.makeSaveFunc(this);
        storage.infos.map( info => new Info(info, infoSave) ).forEach( info => infos[info.id] = info );
        this.#infos = infos;
    }

    async syncFromStorage(): Promise<void> {
        const storage = await getStorageItem("infoList");
        this.storage = storage;
        if (this.#set !== undefined) this.#set(this);
    }


    set svelteSet(set: Subscriber<InfoList> | undefined ) {
        this.#set = set;
    }
    

    async save<T extends keyof UpdateMessageMap>(id: T, item: UpdateMessageMap[T]): Promise<void> {
        if (this.#set !== undefined) this.#set(this);

        await setStorageItem("infoList", this.storage);
        await browser.runtime.sendMessage({ id: id, item: item }).catch(() => {/*WHEN I ADD A SETTINGS PAGE WILL FIX*/});
    }


    startListening(): void {
        browser.runtime.onMessage.addListener(this.#receiveUpdate);
    }

    stopListening(): void {
        browser.runtime.onMessage.removeListener(this.#receiveUpdate);
    }


    //If there are two instances of InfoList (the settings and popup) then when one calls save() the
    //message will be received and call receiveUpdate() . This *should* keep
    //both copies in sync. Key word *should*
    #receiveUpdate<T extends keyof UpdateMessageMap>({id, item}: {id: T, item: UpdateMessageMap[T]} ): void {
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
                const infoSave = Info.makeSaveFunc(this);
                storageInfos.map( info => new Info(info, infoSave) ).forEach( info => infos[info.id] = info );
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



    async modifyInfo(info: Info, name: string, mode: Mode): Promise<void> {
        if (info !== this.#infos[info.id]) throw new Error(`Info with id '${info.id}' is not a valid info reference`);

        const newId = `${mode}-${name}`;
        if (this.checkInfo(newId)) throw new Error(`Info with id '${newId}' already exists`);


        delete this.#infos[info.id];
        await info.modify(name, mode);
        this.#infos[info.id] = info;
        await this.save("infos", this.storage.infos);
     
    }

    getInfo(name: string, mode: Mode): Info | undefined {
        return this.#infos[`${mode}-${name}`];
    }




    async registerNewList(name: string, mode: Mode): Promise<Info> {
        if (this.getInfo(name, mode)) throw new Error(`Info with name '${name}' and mode '${mode}' already exists`);

        const infoSave = Info.makeSaveFunc(this);
        const info = new Info({ name: name, mode: mode, active: false, locked: false, useTimer: false }, infoSave);
        await info.init();
        
        this.#infos[info.id] = info;
        await this.save("infos", this.storage.infos);
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
    async toggleActiveMode(): Promise<void> {
        this.#activeMode = (this.#activeMode === "block") ? "allow" : "block";
        await this.save("activeMode", this.#activeMode);
    }

    get useSchedule(): boolean {
        return this.#useSchedule;
    }
    async toggleUseSchedule(): Promise<void> {
        this.#useSchedule = !this.#useSchedule;
        await this.save("useSchedule", this.#useSchedule);
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

    get currentInfos(): Info[] {
        return Object.values(this.#infos).filter(info => info.mode === this.#activeMode);
    }

    get infos(): Info[] {
        return Object.values(this.#infos);
    }




    


}