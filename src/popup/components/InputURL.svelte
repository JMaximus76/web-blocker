
<script lang="ts">
    import { isBadURL, isHttp } from "../../modules/util";


    export let value = "";
    export let isValid = false;
    
    $: isValid = isBadURL(value);

    function fixValue() {
        if (!isHttp(value) && value !== "") value = "https://" + value;
    }

</script>



<input 
    type="text" 
    placeholder="https://example.com"
    bind:value={value}

    on:blur={fixValue}

    class:invalid={!isValid}
    class:valid={isValid}

    
/>


<style>

    input {
        border-radius: var(--radius);
    }

    .invalid {
        border: solid red 2px;
    }

    .valid {
        border: solid green 2px;
    }


</style>