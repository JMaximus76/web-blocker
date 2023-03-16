
<script lang="ts">
    import { isBadURL } from "../../modules/util";
    //import { onMount } from "svelte";
    import { currentUrlStore } from "../../modules/store";

    export const width: string = "203px";

    export let value = "https://";
    export let isValid = false;

    let self: HTMLElement;
    let dirty: boolean = false;

    //onMount(() => self.focus());
    
    $: isValid = isBadURL(value);
    $: value = value.trim();

    function onKey(event: KeyboardEvent) {
        if (event.key === "Enter") self.blur();
    }

    function setToCurrentURL() {
        value = $currentUrlStore;
    }

    const buttonTitle = "Changes the input to the URL of the current page";

</script>

<label>
    Enter URL
    <div>
        <input
            style="--width:{width}"

            type="text" 
            placeholder="https://example.com"
            bind:value={value}
            bind:this={self}
            class="common"
            class:invalid={!isValid && dirty}
            class:valid={isValid && dirty}
            on:keypress={onKey}
            on:click|once={() => dirty = true}
        />

        <button 
            on:click={setToCurrentURL}
            on:click|once={() => dirty = true} 
            class="common" 
            class:invalid={!isValid && dirty}
            class:valid={isValid && dirty} 
            title={buttonTitle}
            >
            Current URL
        </button>
    </div>
</label>

<style>

    input {
        width: var(--width);
        font-size: 13px;
        color: var(--text);           
    }

    button {
        font-size: 10px;
        padding-right: 0;
        cursor: pointer;
        color: var(--textFade);
    }

    button:hover {
        color: var(--text);
    }
    

    input:focus + button, input:focus {
        border: none;
        background-color: var(--focus);
        
    }

    label {
        font-size: 10px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
    }


    .common {
        border: none;
        box-shadow: 0 2px var(--neutral);
        border-radius: 0;
        outline: none;
        padding: 5px;
        padding-left: 0;
        background-color: transparent;
        transition: box-shadow 0.3s;
    }


    .invalid {
        box-shadow: 0 2px var(--invalid);
    }

    .valid {
        box-shadow: 0 2px var(--valid);
    }



    div {
        display: flex;
        flex-direction: row;
    }


</style>