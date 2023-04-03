<script lang="ts">
    import TextButton from "../components/TextButton.svelte";
    import { storageStore } from "../../stores/storageStores";
    import Lists from "./blocks/Lists.svelte";
    import { fade } from "svelte/transition";
    import { capitalizeFirstLetter } from "../../modules/util";





    // if flickering use onMount and a default version of rts, await the promise then load it on.


    

    function changeMode(): void {
        $storageStore.runtimeSettings.mode = ($storageStore.runtimeSettings.mode === "block")? "allow" : "block";
    }

    function newList(): void {
        storageStore.addList({mode: $storageStore.runtimeSettings.mode});
    }

    const transitionSpeed = 150;

</script>




{#if $storageStore.ready}
    <div class="main">

        
        <div class="topButtons">
            <TextButton onClick={changeMode}>Change Mode</TextButton>
            <TextButton onClick={newList}>New List</TextButton>
        </div>
        
        <div class="info">
            Curent Mode: {capitalizeFirstLetter($storageStore.runtimeSettings.mode)}
        </div>

        <div class="lists">
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

        
        

    </div>
{/if}


    

<style>

    .main {
        background-color: transparent;
        width: 100%;
        display: inline-block;
        padding: 10px;
        box-sizing: border-box;
    }

    .topButtons {
        margin-bottom: 10px;
    }

    .lists {
        display: inline-block;
        height: 215px;
        width: 100%;
        margin: 10px 0px;

        background-color: transparent;

        overflow-y: scroll;
        scrollbar-width: none;
    }

    .lists::-webkit-scrollbar {
        display: none;
    }


</style>