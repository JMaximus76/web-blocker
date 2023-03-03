import browser from 'webextension-polyfill';
import type InfoList from "./infoList";
import List from './list';
import Timer from './timer';
import type { Mode, StorageInfo } from "./types";





export default class Info {

    static async registerNewList(name: string, mode: Mode, ref: InfoList): Promise<Info> {
        const info = new Info( {name: name, mode: mode, active: false, locked: false, useTimer: false}, Info.getRefFunctions(ref) );
        await browser.storage.local.set( { [info.listId]: [] } );
        return info;
    }


    static getRefFunctions(infoList: InfoList) {

        const update = (infoList: InfoList) => (info: Info) => () => infoList.save("info", info.storage);
        const modify = (infoList: InfoList) => (id: string) => (name: string, mode: Mode) => infoList.modifyInfo(id, {name, mode});
        const check  = (infoList: InfoList) => (info: Info) => () => infoList.checkInfo(info.id);

        return {
            update: update(infoList),
            modify: modify(infoList),
            check: check(infoList),
        }
    } 



    

    readonly #update: () => void;
    readonly modify: (name: string, mode: Mode) => void;
    readonly check: () => boolean;

    #name: string;
    #mode: Mode;
    active: boolean;
    locked: boolean;
    useTimer: boolean;





    constructor( { name, mode, active, locked, useTimer }: StorageInfo, { update, modify, check }: ReturnType<typeof Info.getRefFunctions> ) {
        this.#name = name;
        this.#mode = mode;
        this.active = active;
        this.locked = locked;
        this.useTimer = useTimer;

        this.#update = update(this);
        this.modify = modify(this.id);
        this.check = check(this);

 
    }

    get storage(): StorageInfo {
        return {
            name: this.#name,
            mode: this.#mode,
            active: this.active,
            locked: this.locked,
            useTimer: this.useTimer,
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



    async init(): Promise<void> {
        await browser.storage.local.set( { [this.listId]: [] } );
        await browser.storage.local.set( { [this.timerId]: { time: 0, active: false } } );
    }


    async pullList(): Promise<List> {
        const storageItem = await browser.storage.local.get(this.listId);
        return new List(this.listId, storageItem[this.listId]);
    }

    async pullTimer(): Promise<Timer> {
        const storageItem = await browser.storage.local.get(this.timerId);
        return new Timer(this.timerId, storageItem[this.timerId]);
    }

    


    async deleteObjects(): Promise<void> {
        await browser.storage.local.remove(this.listId);
        await browser.storage.local.remove(this.timerId);
    }
    


    get name(): string {
        return this.#name;
    }
    get mode(): Mode {
        return this.#mode;
    }

    rename(name: string, mode: Mode): void {
        this.modify(name, mode);
        this.#name = name;
        this.#mode = mode;
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
        this.useTimer = !this.useTimer;
        this.#update();
    } 


    


}