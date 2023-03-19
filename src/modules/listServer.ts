import Storage from "./storage";
import { v4 as uuidv4 } from 'uuid';


type Mode = "block" | "allow";

type Info = {
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



export default class ListServer {



    #Storage = new Storage();


    registerList(): string {
        const id = uuidv4();


    }




    infoId(id: string): string {
        return `info-${id}`;
    }

    listId(id: string): string {
        return `list-${id}`;
    }

    timerId(id: string): string {
        return `timer-${id}`;
    }



}