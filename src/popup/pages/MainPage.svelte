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
    
    
    
    

    <div id="lists">
        {#if $infoListStore.activeMode === "block"}
            <div transition:fly|local={{x: -300, duration: 200}} id="block"><Lists mode="block" /></div>
        {:else}
            <div transition:fly|local={{x: 300, duration: 200}} id="allow"><Lists mode="allow" /></div>
        {/if}
        
        
    </div>

    <div id="list-info">
        <p>Total Lists: {$infoListStore.currentInfos.length}</p>
        <p>Active Lists: {$infoListStore.activeInfos.length}</p>
    </div>


    <TextButton on:click={toggleIsActive} text={"Toggle Active"} />
    <TextButton on:click={toggleActiveMode} text={"Change Mode"} />

    


    

</div>



    

<style>

    #lists div {
        position: fixed;
    }


    #list-info {
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

    }

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