
<script lang="ts">

    import { fade, fly } from "svelte/transition";
    import ClipPreview from "./blocks/ClipPreview.svelte";
    import InputUrl from "./blocks/InputURL.svelte";
    import TextButton from "../components/TextButton.svelte";
    import type { EntryMode, List } from "../../modules/listComponets";
    import { addEntryDropdownStore } from "../../modules/stores/popupStateStores";


    let url: string;
    let mode: EntryMode;
    let isValid: boolean;

    // should work but it might be null ?? but it also should be an info.
    let list: List = $addEntryDropdownStore.list as List;

    let addButtonTitle = `Add new entry to ${list.info.name}`;

    function addEntry() {
        if (isValid) {
            list.entrys.addEntry(mode, url);
            addEntryDropdownStore.close();
        }
    }

</script>






<button on:click={addEntryDropdownStore.close} transition:fade={{duration: 200}} id="close"></button>




<div transition:fly={{y: -400, duration: 300}} id="main">
    <button on:click={addEntryDropdownStore.close} id="exit">
        Close
    </button>

    <h1>Add List Entry</h1>
    

    

    <div id="input">
        <InputUrl bind:isValid bind:value={url}/>
    </div>

    <div id="mode">
        <ClipPreview bind:isValid bind:mode url={url}/>
    </div>

    

    <div id="add" title={addButtonTitle}>
        <TextButton isActive={isValid} onClick={addEntry}>Add Entry</TextButton>
        <h2>{list.info.name}</h2>
    </div>
</div>






<style>
    #main h1 {
        margin: 0;
        margin-bottom: 10px;
        font-size: 21px;

        font-family: 'Roboto', sans-serif;
        color: var(--text);
    }

    


    #input {
        margin-bottom: 10px;

    }

    #mode {
        margin-top: 15px;
    }

    #main {
        height: 240px;
        width: 290px;
        padding: 10px;

        box-sizing: border-box;

        position: absolute;
        top: 65px;
        left: calc((316px - 290px) / 2);


        background-color: var(--popup);
        
    }

    #close {
        margin: 0;
        padding: 0;
        border: none;
        background-color: transparent;
        height: 416px;
        width: 316px;
        position: absolute;
        top: 0px;
        left: 0px;  
    }


    #add {
        margin-top: 25px;
        float: left;
        display: flex;
        align-items: center;
    }

    #add h2{
        margin: 0 0 0 7px;
        font-size: 16px;
        font-family: 'Roboto', sans-serif;
        font-weight: normal;
        color: var(--text);
    }

    #exit {
        float: right;
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: var(--text);
        transition: color 0.3s;
        font-size: 14px;
        font-family: 'Roboto', sans-serif;
        margin-top: 1px;
        margin-right: 2px;
        font-style: italic;
    }

    #exit:hover {
        color: var(--lightRed);
        
    }
   

   

</style>