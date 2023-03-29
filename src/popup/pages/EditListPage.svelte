<script lang="ts">
    import { popupPageStore } from "../../modules/stores/popupStateStores";
    import InputName from "./blocks/InputName.svelte";


    $: list = $popupPageStore.list;
</script>


{#if list !== null}
    <div class="main">
        <div class="inputName">
            <InputName bind:listName={list.info.name} />
        </div>
            



    </div>
{:else}
    <h1>ERROR: Failed to load list.</h1>
{/if}


<style>
    .inputName {
        width: 190px;
    }
</style>