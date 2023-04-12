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

    function toggleActive() {
        info.active = !info.active;
    }



    let lineColor: string;
    let textKeys: string;


    $: {
        if (value.length > 16) {
            lineColor = "var(--invalid)";
            isValid = false;
            textKeys = "length";
        } else if (value.length <= 0) {
            lineColor = "var(--invalid)";
            isValid = false;
            textKeys = "empty";
        } else {
            lineColor = "var(--neutral)";
            isValid = true;
            textKeys = "";
        }
    }


    const options: Options = {
        buttons: [
            {   
                name: "Toggle",
                title: "Turns the list on or off",
                onClick: toggleActive
                
            },
            {
                name: "Change Mode",
                title: "Switches between blocking and allowing modes",
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
                    text: "Too long",
                    title: "List names must be less than 16 characters long"
                },
                empty: {
                    text: "Empty",
                    title: "List names cannot be empty"
                }
            }
        }
    }

</script>





    

<OptionsBlock options={options} bind:lineColor bind:textKeys enabled={!info.locked}>
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


            <button class="clearButton activeButton" on:click={toggleActive}>
                {(info.active) ? "On" : "Off"}
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
        margin: 0;
        padding: 0;
        color: inherit;
        font: inherit;
    }

    .activeButton {
        width: 36px;
        margin-left: 8px;
    }

</style>