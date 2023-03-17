<script lang="ts">


    import TextButton from "../components/TextButton.svelte";
    import { infoListStore, popupPageStore, settingsStore } from "../../modules/store";
    import Lists from "../components/Lists.svelte";
    import { fly } from "svelte/transition";




    function toggleActiveMode(): void {
        $infoListStore.toggleActiveMode();
    }

    function toggleIsActive(): void {
        popupPageStore.goto("deactivated");
        $settingsStore.toggleIsActive();
    }



</script>





<div id="main">
    
    <TextButton on:click={toggleIsActive} text={"Toggle Active"} />
    <TextButton on:click={toggleActiveMode} text={"Change Mode"} />
    

    <div id="lists">
        {#if $infoListStore.activeMode === "block"}
            <div transition:fly|local={{x: -300, duration: 200}} id="block"><Lists mode="block" /></div>
        {:else}
            <div transition:fly|local={{x: 300, duration: 200}} id="allow"><Lists mode="allow" /></div>
        {/if}
        
        
    </div>

    <div id="info-footer">
        <p>Total Lists: {$infoListStore.currentInfos.length}</p>
        <p>Active Lists: {$infoListStore.activeInfos.length}</p>
    </div>


    

</div>



    

<style>

    #lists div {
        position: fixed;
    }


    #info-footer {
        display: flex;
        flex-direction: row;
        
    }

    #info-footer p {
        font-size: 12px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
        margin: 0;
        display: inline-block;
        margin-left: 7px;

    }

    #main {
        background-color: transparent;
        height: 100%;
        width: 100%;
        display: inline-block;
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