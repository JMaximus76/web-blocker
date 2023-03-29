<script lang="ts">
    import type { Options } from "../../popupTypes";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import { onMount } from "svelte";



    export let listName: string;
    export let isValid = false;

    let value: string = "";
    let self: HTMLInputElement;
    let dirty: boolean = false;

    // this seems like a bad way of doing things but oh well
    let inFocus: boolean = false;


    onMount(() => {
        value = listName;
    });

    
    function onKey(event: KeyboardEvent) {
        if (event.key === "Enter") self.blur();
    }

    function onBlur() {
        value = value.trim();
        if (isValid && value !== "") {
            listName = value
        }

        inFocus = false;
    }

    function onFocus() {
        inFocus = true;
    }

    

    const options: Options = {
        text: {
            globalColor: "var(--lightRed)",
            entrys: {
                length: {
                    text: "Invalid length",
                    title: "List names must be less than 16 characters long"
                },
            }
        }
    }


    let lineColor: string;
    let textKey: string;
    $: {
        //value = value;
        isValid = value.length <= 16;

        if (!isValid && dirty) {
            lineColor = inFocus ? "var(--invalid)" : "transparent";
            textKey = "length";
        } else {
            lineColor = inFocus ? "var(--neutral)" : "transparent";
            textKey = "";
        }
    }

</script>




<OptionsBlock options={options} bind:lineColor bind:textKey>
    <div class="main">
        <h2>Name:</h2>
        <input
            type="text" 
            placeholder="Example Name"
            bind:this={self}
            bind:value
            on:keypress={onKey}
            on:click|once={() => dirty = true}
            on:blur={onBlur}
            on:focus={onFocus}

        />
    </div>
</OptionsBlock>
    

        
 
<style>

    .main {
        display: flex;
        align-items: baseline;
        padding: 4px 0 4px 3px;
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
    }

    input::placeholder {
        color: var(--textFade); 
    }

    

    h2 {
        font-size: 20px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 0;
        margin-right: 4px;
        font-weight: normal;
    }


</style>