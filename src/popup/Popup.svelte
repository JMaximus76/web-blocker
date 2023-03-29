<script lang='ts'>
    import MainPage from "./pages/MainPage.svelte";
    import DeactivatedPage from "./pages/DeactivatedPage.svelte";
    import Header from "./pages/blocks/Header.svelte";
    import { addEntryDropdownStore, popupPageStore } from "../modules/stores/popupStateStores";
    import { fly } from "svelte/transition";
    import AddEntryPopup from "./dropdowns/AddEntry.svelte";
    import EditList from "./pages/EditListPage.svelte";
    import { storageStore } from "../modules/stores/storageStores";


    const transitionTime = 200;


</script>




<div class:blur={$addEntryDropdownStore.active} id="popup">
    <Header />

    {#if $storageStore.ready }
        {#if $popupPageStore.page === "main"}
            <div id="main" 
            in:fly={{x: $popupPageStore.in, duration: transitionTime}} 
            out:fly={{x: $popupPageStore.out, duration: transitionTime}}>
                <MainPage />
            </div>
        {/if}

        {#if $popupPageStore.page === "deactivated"}
            <div id="deactivated" 
            in:fly={{x: $popupPageStore.in, duration: transitionTime}} 
            out:fly={{x: $popupPageStore.out, duration: transitionTime}}>
                <DeactivatedPage />
            </div>
        {/if}

        {#if $popupPageStore.page === "list"}
            <div id="list" 
            in:fly={{x: $popupPageStore.in, duration: transitionTime}} 
            out:fly={{x: $popupPageStore.out, duration: transitionTime}}>
                <EditList />
            </div>
        {/if}
    {/if}

    
    
</div>

{#if $addEntryDropdownStore.active}
    <AddEntryPopup />
{/if}



<style>
    #deactivated, #main, #list {
        position: absolute;
    }


    div {
        height: 400px;
        width: 300px;
    }

    #popup {
        transition: filter 0.2s;
        overflow: hidden;
    }

    .blur {
        filter: blur(20px);
    }

    

    :global(body) {
        background: var(--background);
        overflow: hidden;

    }
</style>