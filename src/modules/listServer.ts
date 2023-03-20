import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';
import browser from "webextension-polyfill";


type Mode = "block" | "allow";

type Info = {
    readonly id: string;
    name: string;
    mode: Mode;
    active: boolean;
    locked: boolean;
    useTimer: boolean;
}


type EntryMode = "domain" | "fullDomain" | "url" | "exact";

type ListEntry = {
    mode: EntryMode;
    value: string;
};

type List = ListEntry[];


type Timer = {
    total: number;
    max: number;
    start: number | null;
}

type ListRecord = string[];



export default class ListServer {

    #storage = new Storage();
    #record: ListRecord = [];

    

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

        const list: List = [];

        const timer: Timer = {
            total: 0,
            max: 0,
            start: null
        }


        this.#storage.add({
            [this.#infoId(id)]: info,
            [this.#listId(id)]: list,
            [this.#timerId(id)]: timer
        });

        return id;
    }

    /** Deletes a list and all of its components */
    deleteList(id: string): void {
        this.#record = this.#record.filter((i) => i !== id);
        this.#updateRecord().catch((e) => console.error(e));
        this.#storage.delete([this.#infoId(id), this.#listId(id), this.#timerId(id)]);
    }

    async requestInfos(requestDetails: { active?: boolean, locked?: boolean, useTimer?: boolean }): Promise<Info[]> {
        const infos: Record<string, Info>;

        



        for (const id of this.#record) {
            if (info) {
                if (requestDetails.active && !info.active) continue;
                if (requestDetails.locked && !info.locked) continue;
                if (requestDetails.useTimer && !info.useTimer) continue;
                infos.push(info);
            }
        }

        return infos;
    }


    #infoId(id: string): string {
        return `info-${id}`;
    }

    #listId(id: string): string {
        return `list-${id}`;
    }

    #timerId(id: string): string {
        return `timer-${id}`;
    }



}