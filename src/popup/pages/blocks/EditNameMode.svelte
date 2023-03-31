<script lang="ts">
    import type { Options } from "../../popupTypes";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import type { Info } from "../../../modules/listComponets";
    import { capitalizeFirstLetter } from "../../../modules/util";;



    export let info: Info;

    let isValid = true;
    let value: string = info.name;
    let self: HTMLInputElement;
    let inFocus: boolean = false;


     
    function onKey(event: KeyboardEvent) {
        if (event.key === "Enter") self.blur();
    }

    function onBlur() {
        if (isValid && value !== "") {
            info.name = value
        }
        inFocus = false;
    }

    function onFocus() {
        inFocus = true;
    }



    let lineColor: string;
    let textKey: string;


    $: {
        if (value.length > 16) {
            lineColor = "var(--invalid)";
            isValid = false;
            textKey = "length";
        } else if (value.length <= 0) {
            lineColor = "var(--invalid)";
            isValid = false;
            textKey = "empty";
        } else {
            lineColor = inFocus ? "var(--neutral)" : "var(--darkNeutral)";
            isValid = true;
            textKey = "";
        }
    }


    const options: Options = {
        buttons: [
            {   
                name: "Change Mode",
                title: "Changes the mode of the list",
                onClick: () => {
                    if (info.locked) return;
                    info.mode = (info.mode === "block")? "allow" : "block";
                }
            }
        ],

        text: {
            globalColor: "var(--lightRed)",
            entrys: {
                length: {
                    text: "List name is too long",
                    title: "List names must be less than 16 characters long"
                },
                empty: {
                    text: "List name cannot be empty",
                    title: "List names must be at least 1 character long"
                }
            }
        }
    }

</script>



<div class="main">

    <div class="container">
        <h2>Mode</h2>
        <h2 style:margin-left="51px">Name</h2>
    </div>

    <OptionsBlock options={options} bind:lineColor bind:textKey enabled={!info.locked}>
        <div class="container">
            <div class="mode">
                {capitalizeFirstLetter(info.mode)}
            </div>

            <div class="name" >
                <input
                    type="text" 
                    placeholder="Example Name"
                    bind:this={self}
                    bind:value
                    on:keypress={onKey}
                    on:blur={onBlur}
                    on:focus={onFocus}
                    spellcheck="false"
                    disabled={info.locked}
                />
            </div>
        </div>
    </OptionsBlock>
</div>   

        
 
<style>

    .main {
        display: flex;
        flex-direction: column;

    }

    .container {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: baseline;
    }

    .mode {
        width: 35px;
        margin-left: 2px;
    }

    .name {
        margin-left: 46px;
    }

    input {
        width: 100%;
        font-size: 14px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
        border: none;
        outline: none;
        background-color: transparent;
        overflow-x: visible;
        box-sizing: border-box;
        padding: 4px 0 0 3px;
        transition: background-color 0.3s;
    }

    input::placeholder {
        color: var(--textFade); 
    }

    

    h2 {
        font-size: 13px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 3px 0 0 0;
        font-weight: normal;
    }


</style>