<script lang="ts">


    import TextButton from "../components/TextButton.svelte";
    import { itemStore } from "../../modules/stores/server";
    import { popupPageStore } from "../../modules/stores/popupState";
    import Lists from "./blocks/Lists.svelte";
    import { fly } from "svelte/transition";





    

    // if flickering use onMount and a default version of rts and await the promise then load it on.


    function toggleIsActive<T extends {isActive: boolean;}>(runtimeSettings: T): void {
        runtimeSettings.isActive = false;
        popupPageStore.deactivated();
    }

</script>




{#await $itemStore.get("runtimeSettings") then rts}
    <div id="main">

        <div id="lists">
            {#if rts.mode === "block"}
                <div transition:fly|local={{x: -300, duration: 200}} id="block"><Lists mode="block" /></div>
            {:else}
                <div transition:fly|local={{x: 300, duration: 200}} id="allow"><Lists mode="allow" /></div>
            {/if}
        </div>

        <!-- <div id="list-info">
            <p>Total Lists: {$infoListStore.currentInfos.length}</p>
            <p>Active Lists: {$infoListStore.activeInfos.length}</p>
        </div> -->


        <TextButton on:click={() => toggleIsActive(rts)} text={"Deactivate"} />
        <TextButton on:click={() => rts.mode = rts.mode === "block"? "allow" : "block"} text={"Change Mode"} />


    </div>
{/await}


    

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