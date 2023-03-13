<script lang="ts">

    import Lists from "../components/Lists.svelte";
    import TextButton from "../components/TextButton.svelte";
    import { AddEntryPopupStore, infoListStore, popupPageStore, settingsStore } from "../../modules/store";
    import InformationBlock from "../components/InformationBlock.svelte";
    //import { capitalizeFirstLetter } from "../../modules/util";




    function toggleActiveMode(): void {
        $infoListStore.toggleActiveMode();
    }

    function toggleIsActive(): void {
        popupPageStore.change("deactivated");
        $settingsStore.toggleIsActive();
    }


    function openAddEntryPopup(): void {
        AddEntryPopupStore.open("you")
    }


</script>





<div id="main">
    

    
    <TextButton on:click={toggleIsActive} text={"Toggle Active"} />
    <TextButton on:click={toggleActiveMode} text={"Change Mode"} />
    <TextButton on:click={openAddEntryPopup} text={"Add Entry"} />

    <!-- <div id="list-header">
        <h1>{capitalizeFirstLetter($infoListStore.activeMode)} Mode</h1>
        
    </div> -->

    <InformationBlock />
    

    <div id="lists">
        <Lists />
    </div>

    <div id="info-footer">
        <p>Total Lists: {$infoListStore.currentInfos.length}</p>
        <p>Active Lists: {$infoListStore.activeInfos.length}</p>
    </div>


    

</div>



    

<style>


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
    }


    /* #list-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-top: 13px;
        margin-left: 10px;
    }

    #list-header h1 {
        font-size: 27px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
        margin: 0;
    } */

    


</style>