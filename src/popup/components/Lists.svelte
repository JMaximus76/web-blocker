<script lang="ts">
    import ListBlock from "./ListBlock.svelte";
    import { infoListStore } from "../../modules/store";
    import type { Info } from "../../modules/types";
    
    let infoList = $infoListStore;
    let currentInfos: Info[] = [];
    $: {
        currentInfos = infoList[infoList.activeMode];
        console.table(currentInfos);
    }
    

</script>

<div>
    {#each $infoListStore[$infoListStore.activeMode] as info}
        <ListBlock info={info} />
    {/each}
</div>



<style>
    div {
        display: flex;
        flex-direction: column;

        width: 100%;
        height: 100%;
        padding: 5px;

        border: solid 2px rgb(241, 241, 241);

    }



</style>

