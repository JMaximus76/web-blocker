<script lang="ts">
    import ListBlock from "./ListBlock.svelte";
    import { infoListStore } from "../../modules/store";

    

</script>

<div>
    {#if $infoListStore.currentInfos.length === 0}

        <p>No {$infoListStore.activeMode} lists</p>
        
    {:else}

        {#each $infoListStore.currentInfos as infos}
            <ListBlock info={infos} />
        {/each}

    {/if}
</div>



<style>
    div {
        display: flex;
        flex-direction: column;

        box-sizing: border-box;

        width: 100%;
        height: 100%;
        padding: 10px;

        border-radius: var(--radius);
        
        box-shadow: -7px -7px 10px var(--light), 7px 7px 10px var(--dark);

    }



</style>

