<script lang='ts'>
    import MainPage from "./pages/MainPage.svelte";
    import DeactivatedPage from "./pages/DeactivatedPage.svelte";
    import Header from "./pages/blocks/Header.svelte";
    import { dropdown, popupPage } from "../stores/popupStateStores";
    import { fly } from "svelte/transition";
    import AddEntry from "./dropdowns/AddEntry.svelte";
    import EditList from "./pages/EditListPage.svelte";
    import { storageStore } from "../stores/storageStores";
    import Confirm from "./dropdowns/Confirm.svelte";


    const transitionTime = 200;


</script>




<div class:blur={$dropdown.state !== "blank"} id="popup">
    <Header showDeactivate={$popupPage.page !== "deactivated"} />

    {#if $storageStore.ready }
        {#if $popupPage.page === "main"}
            <div id="main" 
            in:fly={{x: $popupPage.in, duration: transitionTime}} 
            out:fly={{x: $popupPage.out, duration: transitionTime}}>
                <MainPage />
            </div>
        {/if}

        {#if $popupPage.page === "deactivated"}
            <div id="deactivated" 
            in:fly={{x: $popupPage.in, duration: transitionTime}} 
            out:fly={{x: $popupPage.out, duration: transitionTime}}>
                <DeactivatedPage />
            </div>
        {/if}

        {#if $popupPage.page === "list"}
            <div id="list" 
            in:fly={{x: $popupPage.in, duration: transitionTime}} 
            out:fly={{x: $popupPage.out, duration: transitionTime}}>
                <EditList />
            </div>
        {/if}
    {/if}
</div>

{#if $dropdown.state === "addEntry"}
    <AddEntry />
{/if}

{#if $dropdown.state === "confirm"}
    <Confirm />
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
        height: 400px;
        width: 300px;
    }

    .blur {
        filter: blur(20px);
    }

    :global(body) {
        background: var(--background);
        overflow: hidden;

    }
</style>