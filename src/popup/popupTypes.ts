export type Buttons = {
    [key: string]: {
        onClick: () => void;
        title?: string;
    }


};

export type Radio<T> = {
    [key: string]: {
        value: T;
        title?: string;
    }
};


export type Options = {
    buttons?: Buttons;
    radio?: Radio<any>
}