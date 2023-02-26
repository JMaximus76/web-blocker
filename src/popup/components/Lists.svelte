<script lang="ts">
    import ListBlock from "./ListBlock.svelte";
    import { infoListStore } from "../../modules/store";

    

    $: {
        console.table($infoListStore[$infoListStore.activeMode]);
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

        box-sizing: border-box;

        width: 100%;
        height: 100%;
        padding: 10px;

        border-radius: var(--radius);
        
        box-shadow: -7px -7px 10px var(--light), 7px 7px 10px var(--dark);

    }



</style>

