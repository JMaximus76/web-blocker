type Buttons = {
    [key: string]: {
        onClick: () => void;
        title?: string;
    }


};

type Radio<T> = {
    [key: string]: {
        value: T;
        title?: string;
    }
};


type Options = {
    buttons?: Buttons;
    radio?: Radio<any>
}