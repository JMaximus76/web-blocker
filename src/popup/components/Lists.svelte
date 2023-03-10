<script lang="ts">
    import ListBlock from "./ListBlock.svelte";
    import { infoListStore } from "../../modules/store";

    

</script>

<div>
    {#if $infoListStore.currentInfos.length === 0}

        <p>No {$infoListStore.activeMode} lists</p>
        
    {:else}

        {#each $infoListStore.currentInfos as infos (infos.id)}
            <ListBlock info={infos} />
        {/each}

    {/if}
</div>



<style>
    div {

        width: 100%;
        height: 100%;



        border-radius: var(--radius);
        background-color: var(--panel);

        overflow-y: scroll;
        scrollbar-width: none;
    }



</style>

