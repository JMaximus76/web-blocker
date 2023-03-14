import type { Subscriber } from "svelte/store";
import browser from "webextension-polyfill";
import Info from "./info";
import { getStorageItem, setStorageItem } from "./storage";
import type { StorageInfo, Mode, UpdateMessageMap, StorageInfoList } from "./types";
import { sendMessage, type Message } from "./util";



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


    
    

    async save<T extends keyof UpdateMessageMap>(id: T, item: UpdateMessageMap[T]): Promise<void> {
        if (this.#set !== undefined) this.#set(this);

        await setStorageItem("infoList", this.storage);
        await sendMessage({ for: "infoList", id: id, item: item });
        await sendMessage({ for: "backgroundScript", id: "update" });
        
    }


    startListening(set: Subscriber<InfoList>): void {
        this.#set = set;
        browser.runtime.onMessage.addListener(this.#onMessage);
    }

    stopListening(): void {
        this.#set = undefined;
        browser.runtime.onMessage.removeListener(this.#onMessage);
    }


    //If there are two instances of InfoList (the settings and popup) then when one calls save() the
    //message will be received and call receiveUpdate() . This *should* keep
    //both copies in sync. Key word *should*
    #onMessage(message: Message): void {
        if (message.for !== "infoList") return;
        if (message.item === undefined) throw new Error("An infoList get a message with no item");
        if (this.#set === undefined) throw new Error("InfoList.#onMessage: set shoudl be set but is not");

        switch (message.id) {
            case "info":
                const storageInfo = message.item as UpdateMessageMap["info"];
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
                const storageInfos = message.item as UpdateMessageMap["infos"];
                const infos: Record<string, Info> = {};
                const infoSave = Info.makeSaveFunc(this);
                storageInfos.map( info => new Info(info, infoSave) ).forEach( info => infos[info.id] = info );
                this.#infos = infos;
                break;

            case "activeMode":
                this.#activeMode = message.item as UpdateMessageMap["activeMode"];
                break;

            case "useSchedule":
                this.#useSchedule = message.item as UpdateMessageMap["useSchedule"];
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

    getInfoWithId(id: string): Info | undefined {
        return this.#infos[id];
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




    async getActiveMatch(url: string): Promise<Info[]> {
        const infos: Info[] = [];

        for (const info of this.activeInfos) {
            if (info.active && (await info.pullList()).check(url)) {
                infos.push(info)
            }
        }
        
        return infos;
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