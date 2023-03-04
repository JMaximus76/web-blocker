import browser from 'webextension-polyfill';
import type InfoList from "./infoList";
import List from './list';
import Timer from './timer';
import type { Mode, StorageInfo } from "./types";





export default class Info {

    static async registerNewList(name: string, mode: Mode, ref: InfoList): Promise<Info> {
        const info = new Info( {name: name, mode: mode, active: false, locked: false, useTimer: false}, Info.makeSaveFunc(ref) );
        await browser.storage.local.set( { [info.listId]: [] } );
        return info;
    }


    static makeSaveFunc(infoList: InfoList) {

        return (info: Info) => () => infoList.save("info", info.storage);

    } 



    

    readonly save: () => ReturnType<typeof InfoList.prototype.save>;
    #name: string;
    #mode: Mode;
    active: boolean;
    locked: boolean;
    useTimer: boolean;





    constructor( { name, mode, active, locked, useTimer }: StorageInfo, save: ReturnType<typeof Info.makeSaveFunc> ) {
        this.#name = name;
        this.#mode = mode;
        this.active = active;
        this.locked = locked;
        this.useTimer = useTimer;

        this.save = save(this);
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
        const list = new List(this.listId, []);
        await list.save();
        const timer = new Timer(this.timerId, { total: 0, max: 0, start: 0 });
        await timer.save();
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

    async modify(name: string, mode: Mode): Promise<void> {

        const list = await this.pullList();
        const timer = await this.pullTimer();

        this.#name = name;
        this.#mode = mode;

        await list.resetId(this);
        await timer.resetId(this);

    }
    


    async toggleActive(): Promise<void> {
        this.active = !this.active;
        await this.save();
    }
    async toggleLocked(): Promise<void> {
        this.locked = !this.locked;
        await this.save();
    }
    async toggleTimer(): Promise<void> {
        this.useTimer = !this.useTimer;
        await this.save();
    } 


    


}