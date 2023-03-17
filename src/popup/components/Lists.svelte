<script lang="ts">
    import { infoListStore } from "../../modules/store";
    import type { Mode } from "../../modules/types";

    
    import ListBlock from "../components/ListBlock.svelte";


    export let mode: Mode;

    $: list = (mode === "block")? $infoListStore.block : $infoListStore.allow;
    

</script>

<div>
    {#if list.length === 0}

        <p>No {mode} lists</p>
        
    {:else}

        {#each list as infos (infos.id)}
            <ListBlock info={infos} />
        {/each}

    {/if}
</div>

