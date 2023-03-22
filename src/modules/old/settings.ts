import type { Subscriber } from "svelte/store"
import { pullItem, pushItem } from "./storage"
import browser from "webextension-polyfill"
import { sendMessage, type Message } from "../util"



type SettingsMap = {
    isActive: boolean
}



class Settings {


    static async init(): Promise<void> {
        const settings: SettingsMap = {
            isActive: true,
        }

        for (const key in settings) {
            // this hurt my soul to write :) smile
            await Settings.setSetting(key as keyof SettingsMap, settings[key as keyof SettingsMap])
        }
    }


    static async getSetting<T extends keyof SettingsMap>(setting: T): Promise<SettingsMap[T]> {
        return await pullItem(setting);

    }

    static async setSetting<T extends keyof SettingsMap>(setting: T, value: SettingsMap[T]): Promise<void> {
        await pushItem(setting, value);
    }



    #isActive: boolean = true;
    #set: Subscriber<Settings> | undefined;


    async syncFromStorage(): Promise<void> {
        this.#isActive = await Settings.getSetting("isActive");
    }


    startListening(set: Subscriber<Settings>) {
        this.#set = set;
        browser.runtime.onMessage.addListener(this.#onMessage);
    }

    stopListening() {
        this.#set = undefined;
        browser.runtime.onMessage.removeListener(this.#onMessage);
    }

    async #save(id: string, value: any) {
        if (this.#set !== undefined) this.#set(this);
        const message: Message = {
            for: "settings",
            id: id,
            item: value,
        }
        await sendMessage(message);
        await Settings.setSetting(id as keyof SettingsMap, value);
    }

    #onMessage(message: Message) {
        if (message.for !== "settings") return;
        if (this.#set === undefined) throw new Error("Settings.#onMessage: set should be set but is not");
        
        switch (message.id) {
            case "isActive":
                this.#isActive = message.item;
                break;
        }

        this.#set(this);
    }


    get isActive() {
        return this.#isActive;
    }

    async toggleIsActive() {
        this.#isActive = !this.#isActive;
        await this.#save("isActive", this.#isActive);
        await sendMessage({ for: "backgroundScript", id: "update" });
    }




}