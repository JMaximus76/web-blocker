export type Buttons = {
    name: string;
    onClick: () => void;
    title?: string;
}[];

export type Radio<T> = {
    name: string;
    value: T;
    title?: string;
}[];

export type Text = {
    globalColor?: string;
    entries: {
        [key: string]: {
            text: string;
            color?: string;
            title?: string; 
        }
    }
};


export type Options = {
    buttons?: Buttons;
    radio?: Radio<any>
    text?: Text;
}