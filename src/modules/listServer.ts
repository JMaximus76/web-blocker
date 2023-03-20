import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';
import browser from "webextension-polyfill";
import type { Subscriber } from "svelte/store";
import type { Entry, Info, Mode, Timer } from "./listComponets";




type ListRecord = string[];

type RequestMap = {
    info: Info;
    entrys: Entry[];
    timer: Timer;
}

export default class ListServer {

    #storage = new Storage();
    #record: ListRecord = [];
    #svelte: Subscriber<ListServer> | null = null;


    set svelte(s: Subscriber<ListServer>) {
        this.#svelte = s;
    }
    

    /** Syncs the internal record to the one in local storage. */
    async sync(): Promise<void> {
        // should change this probably
        this.#record = (await browser.storage.local.get("record"))["record"];
    }

    /** Updates the record in local storage . */
    async #updateRecord(): Promise<void> {
        // should change this probably
        await browser.storage.local.set({ record: this.#record });
    }




    /** Registers a new list and all of its components. */
    registerList(): string {
        const id = uuidv4();

        this.#record.push(id);
        this.#updateRecord().catch((e) => console.error(e));

        const info: Info = {
            name: "New List",
            mode: "block",
            id,
            active: true,
            locked: false,
            useTimer: false
        }

        const entrys: Entry[] = [];

        const timer: Timer = {
            total: 0,
            max: 0,
            start: null
        }


        this.#storage.add({
            [this.#infoId(id)]: info,
            [this.#entrysId(id)]: entrys,
            [this.#timerId(id)]: timer
        });

        return id;
    }

    /** Deletes a list and all of its components */
    deleteList(id: string): void {
        this.#record = this.#record.filter((i) => i !== id);
        this.#updateRecord().catch((e) => console.error(e));
        this.#storage.delete([this.#infoId(id), this.#entrysId(id), this.#timerId(id)]);
    }







    /** Gets requested list Infos from storage. */
    async requestInfos({active, mode, useTimer}: { active?: boolean, mode?: Mode, useTimer?: boolean }): Promise<Info[]> {
        const items = await this.#storage.get<Info>(this.#record.map((id) => this.#infoId(id)));
        
        const infos = items.filter((item) => {
            if (item === undefined) return false;
            if (active !== undefined && item.active !== active) return false;
            if (mode !== undefined && item.mode !== mode) return false;
            if (useTimer !== undefined && item.useTimer !== useTimer) return false;
            return true;
        });

        return infos.map((o) => this.#svelteProxy(o));
    }

    /** Gets requested list Entrys from storage. */
    async requestEntrys(details: { active?: boolean, mode?: Mode, useTimer?: boolean }): Promise<Entry[]> {
        const infos = await this.requestInfos(details);
        const items = await this.#storage.get<Entry>(infos.map((info) => this.#entrysId(info.id)));
        return items.map((o) => this.#svelteProxy(o));
    }

    /** Gets requested list Timers from storage. */
    async requestTimers(details: { active?: boolean, mode?: Mode, useTimer?: boolean }): Promise<Timer[]> {
        const infos = await this.requestInfos(details);
        const items = await this.#storage.get<Timer>(infos.map((info) => this.#timerId(info.id)));
        return items.map((o) => this.#svelteProxy(o));
    }

    async requestById<T extends keyof RequestMap>(request: keyof RequestMap, id: string): Promise<RequestMap[T]> {
        switch(request) {
            case "info": id = this.#infoId(id); break;
            case "entrys": id = this.#entrysId(id); break;
            case "timer": id = this.#timerId(id); break;
        }

        const item = await this.#storage.get<RequestMap[T]>(id);
        return this.#svelteProxy(item[0]);
    }



    #svelteProxy<T extends object>(obj: T) {
        return new Proxy(obj, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value);
                if (this.#svelte !== null) this.#svelte(this);
                return true;
            }
        });
    }



    #infoId(id: string): string {
        return `info-${id}`;
    }

    #entrysId(id: string): string {
        return `list-${id}`;
    }

    #timerId(id: string): string {
        return `timer-${id}`;
    }

}