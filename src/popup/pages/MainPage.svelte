<script lang="ts">
    import TextButton from "../components/TextButton.svelte";
    import { storageStore } from "../../stores/storageStores";
    import Lists from "./blocks/Lists.svelte";
    import { fade } from "svelte/transition";
    import { capitalizeFirstLetter } from "../../modules/util";
    import { popupPage } from "../../stores/popupStateStores";


    function changeMode(): void {
        $storageStore.runtimeSettings.mode = ($storageStore.runtimeSettings.mode === "block")? "allow" : "block";
    }

    function newList(): void {
        storageStore.addList({mode: $storageStore.runtimeSettings.mode}).then((list) => popupPage.list(list));
    }

    const transitionSpeed = 150;

</script>




{#if $storageStore.ready}
    <div class="main">

        
        
        
        <div class="listsHeader">
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

        <div class="buttons">
            <div><TextButton onClick={newList}>New List</TextButton></div>
            <div><TextButton onClick={changeMode}>Change Mode</TextButton></div>
        </div>
    </div>
{/if}


    

<style>

    .main {
        background-color: transparent;
        display: inline-block;
        padding: 0 10px;
    }

    .lists {
        display: inline-block;
        height: 215px;
        width: 300px;
        margin: 10px 0px;

        background-color: transparent;

        overflow-y: scroll;
        scrollbar-width: none;
    }

    .lists::-webkit-scrollbar {
        display: none;
    }

    .listsHeader {
        font-size: 20px;
        color: var(--text);
        font-family: 'Roboto', sans-serif;
    }

    .buttons {
        margin-top: 10px;
        display: flex;

    }

    .buttons div {
        margin-right: 10px;
    }


</style>