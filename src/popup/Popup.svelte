<script lang='ts'>
    import MainPage from "./pages/MainPage.svelte";
    import DeactivatedPage from "./pages/DeactivatedPage.svelte";
    import Header from "./components/Header.svelte";
    import { popupPageStore } from "../modules/store";
    import { fly } from "svelte/transition";
    import Settings from "../modules/settings";
    import { onMount } from "svelte";
    import AddEntryPopup from "./components/AddEntryPopup.svelte";


    let loading: Promise<void>;
    onMount(() => {
        loading = Settings.getSetting("isActive").then((isActive) => {
            if (isActive) {
                popupPageStore.change("main");
            } else  {
                popupPageStore.change("deactivated");
            }
        });
    })
    



    const transitionTime = 200;


</script>




<div id="container">
    <Header />

    {#await loading then}
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
    {/await}

    <AddEntryPopup />
    
</div>






<style>
    #deactivated, #main {
        position: absolute;
    }


    div {
        height: 400px;
        width: 300px;
    }

    :global(body) {
        background: var(--background);
        overflow: hidden;
    }
</style>