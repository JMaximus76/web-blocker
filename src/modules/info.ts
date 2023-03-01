import browser from 'webextension-polyfill';
import type { InfoList } from "./infoList";
import type { List, Mode, StorageInfo, Timer } from "./types";





export class Info {
    readonly #update: () => void;
    readonly modify: () => void;
    readonly check: () => boolean;

    
    
    static async registerNewList(name: string, mode: Mode, ref: InfoList): Promise<Info> {
        const info = new Info( {name: name, mode: mode, active: false, locked: false, timer: false}, Info.refFunctions(ref) );
        await browser.storage.local.set( { [info.listId]: [] } );
        return info;
    }


    static refFunctions(infoList: InfoList) {

        const update = (infoList: InfoList) => (info: Info) => () => infoList.updateInfo(info);
        const modify = (infoList: InfoList) => (info: Info, id: string) => () => infoList.modifyInfo(id, info);
        const check  = (infoList: InfoList) => (info: Info) => () => infoList.checkInfo(info.id);

        return {
            update: update(infoList),
            modify: modify(infoList),
            check: check(infoList),
        }
    } 
    


    #name: string;
    #mode: Mode;
    active: boolean;
    locked: boolean;
    timer: boolean;

    constructor( { name, mode, active, locked, timer }: StorageInfo, { update, modify, check }: ReturnType<typeof Info.refFunctions> ) {
        this.#name = name;
        this.#mode = mode;
        this.active = active;
        this.locked = locked;
        this.timer = timer;

        this.#update = update(this);
        this.modify = modify(this, this.id);
        this.check = check(this);

    }

    get storage(): StorageInfo {
        return {
            name: this.#name,
            mode: this.#mode,
            active: this.active,
            locked: this.locked,
            timer: this.timer,
        };
    }


    get id(): string {
        return `${this.#mode}-${this.#name}`;
    }
    get listId(): string {
        return `list-${this.#mode}-${this.#name}`;
    }
    get timerId(): string {
        return `timer-${this.#mode}-${this.#name}`;
    }


    async pullList(): Promise<List> {
        const storageItem = await browser.storage.local.get(this.listId);
        return storageItem[this.listId] as List;
    }

    async pullTimer(): Promise<Timer> {
        const storageItem = await browser.storage.local.get(this.timerId);
        return storageItem[this.timerId] as Timer;
    }

    


    get name(): string {
        return this.#name;
    }
    get mode(): Mode {
        return this.#mode;
    }
    


    toggleActive(): void {
        this.active = !this.active;
        this.#update();
    }
    toggleLocked(): void {
        this.locked = !this.locked;
        this.#update();
    }
    toggleTimer(): void {
        this.timer = !this.timer;
        this.#update();
    }


    set name(name: string) {
        this.#name = name;
        this.modify();
    }

    set mode(mode: Mode) {
        this.#mode = mode;
        this.modify();
    }


}