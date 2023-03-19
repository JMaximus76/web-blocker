import browser from 'webextension-polyfill';
import type InfoList from "./infoList";
import List from './list';
import { pullItem } from './storage';
import Timer from './timer';
import type { ListEntry, Mode, StorageInfo, StorageTimer } from "./types";





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
    }


    async pullList(): Promise<List> {
        const list: ListEntry[] = await pullItem(this.listId);
        return new List(this.listId, list);
    }

    async pullTimer(): Promise<Timer> {
        if (this.useTimer === false) throw new Error("can't use pullTimer if useTimer is not true");
        const timer: StorageTimer = await pullItem(this.timerId);
        return new Timer(this.timerId, timer);
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
        await timer.changeId(this);

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
        if (this.useTimer) {
            await browser.storage.local.remove(this.timerId);
        } else {
            await Timer.initNewTimer(this.timerId);
        }

        this.useTimer = !this.useTimer;
        await this.save();
    } 


    


}