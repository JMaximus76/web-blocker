<script lang="ts">
    import TextButton from "../components/TextButton.svelte";
    import { storageStore } from "../../modules/stores/storageStores";
    import { popupPageStore } from "../../modules/stores/popupStateStores";
    import Lists from "./blocks/Lists.svelte";
    import { fade } from "svelte/transition";





    // if flickering use onMount and a default version of rts, await the promise then load it on.


    function deactivate(): void {
        $storageStore.runtimeSettings.isActive = false;
        popupPageStore.deactivated();
    }

    function changeMode(): void {
        $storageStore.runtimeSettings.mode = ($storageStore.runtimeSettings.mode === "block")? "allow" : "block";
    }

    const transitionSpeed = 150;

</script>




{#if $storageStore.ready}
    <div id="main">

        <div id="lists">
            {#if $storageStore.runtimeSettings.mode === "block"}
                <div 
                in:fade|local={{duration: transitionSpeed, delay: transitionSpeed}} 
                out:fade|local={{duration: transitionSpeed}} id="block">
                    <Lists mode="block" />
                </div>
            {:else}
                <div 
                in:fade|local={{duration: transitionSpeed, delay: transitionSpeed}} 
                out:fade|local={{duration: transitionSpeed}} id="allow">
                    <Lists mode="allow" />
                </div>
            {/if}
        </div>

        <!-- <div id="list-info">
            <p>Total Lists: {$infoListStore.currentInfos.length}</p>
            <p>Active Lists: {$infoListStore.activeInfos.length}</p>
        </div> -->


        <TextButton on:click={deactivate}>Deactivate</TextButton>
        <TextButton on:click={changeMode}>Change Mode</TextButton>


    </div>
{/if}


    

<style>

    #lists div {
        position: fixed;
    }


    /* #list-info {
        display: flex;
        flex-direction: row;
        
    }

    #list-info p {
        font-size: 12px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
        margin: 0;
        display: inline-block;
        margin-right: 15px;

    } */

    #main {
        background-color: transparent;
        height: 100%;
        width: 100%;
        display: inline-block;
        padding-left: 10px;
    }

    #lists {
        display: inline-block;
        height: 215px;
        width: 100%;
        margin: 10px 0px;

        background-color: var(--panel);

        overflow-y: scroll;
        scrollbar-width: none;
    }

    #lists::-webkit-scrollbar {
        display: none;
    }


</style>