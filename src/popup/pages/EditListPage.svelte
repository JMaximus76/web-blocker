 

<script lang="ts">
    import { onMount } from "svelte";
    import { popupPageStore } from "../../modules/store";
    import TextButton from "../components/TextButton.svelte";

    

    onMount(() => {
        
    });


</script>



<div title={undefined}>
    <TextButton  on:click={() => popupPageStore.main()} text={"back"} />
</div>
    
