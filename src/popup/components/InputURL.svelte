
<script lang="ts">
    import { isBadURL } from "../../modules/util";
    import { onMount } from "svelte";
    import { currentUrlStore } from "../../modules/store";

    export const width: string = "163px";

    export let value = "https://";
    export let isValid = false;
    let self: HTMLElement;

    onMount(() => self.focus());
    
    $: isValid = isBadURL(value);

    function onKey(event: KeyboardEvent) {
        if (event.key === "Enter") self.blur();
    }

    function setToCurrentURL() {
        value = $currentUrlStore;
    }

    const buttonTitle = "Changes the input to the URL of the current page";

</script>


<div>
    <input
        style="--width:{width}"

        type="text" 
        placeholder="https://example.com"
        bind:value={value}
        bind:this={self}
        class="common"
        class:invalid={!isValid}
        class:valid={isValid}
        on:keypress={onKey}
    />

    <button on:click={setToCurrentURL} class="common" class:invalid={!isValid} class:valid={isValid} title={buttonTitle}>Current URL</button>
</div>

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
        box-shadow: 0 2px var(--neutral);
        background-color: var(--focus);
        
    }

    


    .common {
        border: none;
        box-shadow: 0 0 black;
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