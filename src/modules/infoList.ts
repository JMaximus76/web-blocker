import browser from "webextension-polyfill";
import { Info } from "./info";
import { getStorageItem, setStorageItem } from "./storage";
import type { StorageInfo, Mode, UpdateMessageMap, StorageInfoList } from "./types";



export class InfoList {
    #updateSent: boolean = false;

    #activeMode: Mode;
    #useSchedule: boolean;

    #infos: Record<string, Info>;

    readonly #infoRefs = Info.refFunctions(this);

    

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


    

    save<T extends keyof UpdateMessageMap>(id: T, item: UpdateMessageMap[T]): void {
        this.#updateSent = true;
        browser.runtime.sendMessage({ id: id, item: item })
            .then(() => setStorageItem("infoList", this.storage))
            .catch((e) => console.error(e));
    }

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
                    info.timer = storageInfo.timer;
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

    


    updateInfo(info: Info): void {
        if (!this.checkInfo(info.id)) {
            console.log(new Error(`Info with id '${info.id}' does not exist`));
            return;
        }

        this.#infos[info.id] = info;
        this.save("info", info.storage);
    }

    checkInfo(id: string): boolean {
        return this.#infos[id] !== undefined;
    }


    addInfo(info: Info): void {
        if (this.checkInfo(info.id)) {
            console.log(new Error(`Info with id '${info.id}' already exists`));
            return;
        }
        
        this.#infos[info.id] = info;
        this.save("infos", this.storage.infos);
    }

    removeInfo(id: string): void {
        delete this.#infos[id];
        this.save("infos", this.storage.infos);
    }

    modifyInfo(id: string, info: Info): void {
        if (!this.checkInfo(id)) {
            console.log(new Error(`Info with id '${id}' does not exist`));
            return;
        }
        if (this.checkInfo(info.id)) {
            console.log(new Error(`Info with id '${info.id}' already exists`));
            return;
        }

        this.removeInfo(id);
        this.addInfo(info);
    }

    getInfo(name: string, mode: Mode): Info | undefined {
        return this.#infos[`${mode}-${name}`];
    }




    async registerNewList(name: string, mode: Mode) {
        if (this.getInfo(name, mode)) {
            console.log(new Error(`Info with name '${name}' and mode '${mode}' already exists`));
            return;
        }

        const info = new Info({ name: name, mode: mode, active: false, locked: false, timer: false }, this.#infoRefs);
        this.addInfo(info);
        this.save("infos", this.storage.infos);
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


    




    



}