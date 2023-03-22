<script lang="ts">
    import type { Mode } from "../../../modules/listComponets";
    import { listStore } from "../../../modules/stores/server";
    

    
    import ListBlock from "./ListBlock.svelte";


    export let mode: Mode;

    $: promiseList = (mode === "block")? $listStore.request("info", {mode: "block"}) : $listStore.request("info", {mode: "block"});
    

</script>

{#await promiseList then list}
    <div>
        {#if list.length === 0}

            <p>No {mode} lists</p>
            
        {:else}

            {#each list as infos (infos.id)}
                <ListBlock info={infos} />
            {/each}

        {/if}
    </div>
{/await}
