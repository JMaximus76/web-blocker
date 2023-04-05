<script lang="ts">
    import type { Options } from "../../popupTypes";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import type { Info } from "../../../modules/listComponets";
    import { capitalizeFirstLetter } from "../../../modules/util";;
    import { storageStore } from "../../../stores/storageStores";
    import { popupPage } from "../../../stores/popupStateStores";
    import { dropdown } from "../../../stores/popupStateStores";



    export let info: Info;

    let isValid = true;
    let value: string = info.name;
    let self: HTMLInputElement;



     
    function onKey(event: KeyboardEvent) {
        if (event.key === "Enter") self.blur();
    }

    function onBlur() {
        if (isValid && value !== "") {
            info.name = value
        }
    }

    function deleteList() {
        storageStore.deleteList(info.id);
        popupPage.main();
    }

    function changeMode() {
        info.mode = (info.mode === "block")? "allow" : "block";
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
            lineColor = "var(--neutral)";
            isValid = true;
            textKey = "";
        }
    }


    const options: Options = {
        buttons: [
            {   
                name: "Toggle Mode",
                title: "Changes the mode of the list",
                onClick: changeMode
                
            },
            {
                name: "Delete",
                title: "Deletes the list",
                onClick: () => dropdown.confirm(deleteList, `Delete ${info.name}`)
                
            }
        ],

        text: {
            globalColor: "var(--lightRed)",
            entrys: {
                length: {
                    text: "Name is too long",
                    title: "List names must be less than 16 characters long"
                },
                empty: {
                    text: "Name cannot be empty",
                    title: "List names must be at least 1 character long"
                }
            }
        }
    }

</script>





    

<OptionsBlock options={options} bind:lineColor bind:textKey enabled={!info.locked}>
    <div class="main">

        <div class="row">
            <div class="name" >
                <input
                    type="text" 
                    placeholder="Example Name"
                    bind:this={self}
                    bind:value
                    on:keypress={onKey}
                    on:blur={onBlur}
                    spellcheck="false"
                    disabled={info.locked}
                />
            </div>

            <button class="clearButton" on:click={changeMode}>
                {capitalizeFirstLetter(info.mode)}
            </button>

        </div>


    </div>
</OptionsBlock>
  

        
 
<style>

    .main {
        display: flex;
        flex-direction: column;
        font-size: 17px;
    }

    .row {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: baseline;
    }


    input {
        width: 100%;
        font-size: 17px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
        border: none;
        outline: none;
        background-color: transparent;
        overflow-x: visible;
        box-sizing: border-box;
        padding: 4px 10px 0 3px;
        transition: background-color 0.3s;
    }

    input::placeholder {
        color: var(--textFade); 
    }

    .clearButton {
        background-color: transparent;
        border: none;
        margin: none;
        padding: none;
        color: inherit;
        font: inherit;
    }

</style>