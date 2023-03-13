
<script lang="ts">
    import { isURL } from "../../modules/util";


    export let value = "";
    export let isValid = false;
    
    $: isValid = isURL(value);


    

</script>



<input 
    type="text" 
    placeholder="https://example.com"
    bind:value={value}


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