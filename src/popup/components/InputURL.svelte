
<script lang="ts">
    import { isBadURL } from "../../modules/util";
    //import { onMount } from "svelte";
    import { currentUrlStore } from "../../modules/store";



    export let value = "";
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

    const buttonTitle = "Inserts the URL of the current page";

</script>

<label>
    <h2>Enter URL</h2>
    <div>
        <input
            type="text" 
            placeholder="https://example.com"
            bind:value={value}
            bind:this={self}
            class:invalid={!isValid && dirty}
            class:valid={isValid && dirty}
            on:keypress={onKey}
            on:click|once={() => dirty = true}
        />

        
    </div>
</label>

<button 
    on:click={setToCurrentURL}
    on:click|once={() => dirty = true} 
    title={buttonTitle}
>
Current URL
</button>

<style>

    input {
        width: 100%;
        font-size: 13px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);   
        box-shadow: 0 2px var(--neutral);
        
        border: none;
        
        border-radius: 0;
        outline: none;
        padding: 2px 5px 2px 2px;
        background-color: transparent;
        transition: box-shadow 0.3s;
    }

    input::placeholder {
        color: var(--textFade); 
    }

    input:focus {
        border: none;
        background-color: var(--focus);
        
    }

    label {
        font-size: 10px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        
    }

    button {
        font-size: 10px;
        cursor: pointer;
        color: var(--textFade);
        border: none;
        background-color: transparent;
        padding: 0;
        transition: color 0.2s;
    }

    button:hover {
        color: var(--text);
    }


    h2 {
        font-size: 13px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 3px 0 0 0;
        font-weight: normal;
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