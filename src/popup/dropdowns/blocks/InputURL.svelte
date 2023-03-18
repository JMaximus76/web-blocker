
<script lang="ts">
    import { isBadURL } from "../../../modules/util";
    import { currentUrlStore } from "../../../modules/store";
    import type { Options } from "../../../modules/types";
    import OptionsBlock from "../../components/OptionsBlock.svelte";



    export let value = "";
    export let isValid = false;

    let self: HTMLElement;
    let dirty: boolean = false;
    
    $: isValid = isBadURL(value);
    $: value = value.trim();

    function onKey(event: KeyboardEvent) {
        if (event.key === "Enter") self.blur();
    }

    function setToCurrentURL() {
        dirty = true;
        value = $currentUrlStore;
    }


    const options: Options = {
        buttons: {
            "Current URL": {
                onClick: setToCurrentURL,
                title: "Inserts the URL of the current page"
            }
        }
    }


    let lineColor: string;

    $: {
        if (!isValid && dirty) {
            lineColor = "var(--invalid)";
        } else if (isValid){
            lineColor = "var(--valid)";
        } else {
            lineColor = "var(--neutral)";
        }
    }

</script>


<h2>Enter URL</h2>

<OptionsBlock options={options} bind:lineColor>
    <input
        type="text" 
        placeholder="https://example.com"
        bind:value={value}
        bind:this={self}
        on:keypress={onKey}
        on:click|once={() => dirty = true}
    />
</OptionsBlock>
    

        
 
<style>

    input {
        width: 100%;
        font-size: 14px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);   
        border: none;
        outline: none;
        background-color: transparent;
        padding: 4px 0 4px 3px;
        overflow-x: visible;
        box-sizing: border-box;
    }

    input::placeholder {
        color: var(--textFade); 
    }

    input:focus {
        background-color: var(--focus);
        
    }

    h2 {
        font-size: 13px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 3px 0 0 0;
        font-weight: normal;
    }


</style>