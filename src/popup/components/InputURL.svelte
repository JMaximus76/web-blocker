
<script lang="ts">
    import { isBadURL } from "../../modules/util";
    import { onMount } from "svelte";


    export let value = "";
    export let isValid = false;
    let self: HTMLElement;

    onMount(() => self.focus());
    
    $: isValid = isBadURL(value);

    // function fixValue() {
    //     if (!isHttp(value) && value !== "") value = "https://" + value;
    // }

</script>



<input 
    type="text" 
    placeholder="https://example.com"
    bind:value={value}
    bind:this={self}

    class:invalid={!isValid}
    class:valid={isValid}
/>


<style>

    input {
        border-radius: var(--radius);
        border: none;
        box-shadow: 0 0 black;
        border-radius: 0;
        outline: none;
        padding: 5px;
        background-color: transparent;
        color: var(--text);
    }

    input:focus-visible {
        border:none;
    }


    .invalid {
        box-shadow: 0 2px var(--invalid);
    }

    .valid {
        box-shadow: 0 2px var(--valid);
    }


</style>