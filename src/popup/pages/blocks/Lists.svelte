<script lang="ts">
    import type { Mode } from "../../../modules/listComponets";
    import { storageStore } from "../../../modules/stores/storage";
    

    
    import ListBlock from "./ListBlock.svelte";


    export let mode: Mode;

    $: lists = Object.values($storageStore.lists).filter((list) => list.info.mode === mode);
    

</script>


<div>
    {#if lists.length === 0}

        <p>No {mode} lists</p>
        
    {:else}

        {#each lists as list (list.info.id)}
            <ListBlock list={list} />
        {/each}

    {/if}
</div>

