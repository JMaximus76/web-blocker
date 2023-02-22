<script lang="ts">
    import type { InfoList } from "../../modules/types";
    import InfoBlock from "./InfoBlock.svelte";


    export let infoList: InfoList;
</script>




<div id="current-lists">
    <lable>Current Lists</lable>
    {#each infoList[infoList.activeMode] as info}
        <InfoBlock {info} />
    {/each}
</div>



<style>
    div {
        display: flex;
        flex-direction: column;
    }
</style>