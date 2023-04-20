<script lang="ts">
    import { fade } from "svelte/transition";
    import { dropdown, popupPage } from "../../stores/popupStateStores";
    import TextButton from "../components/TextButton.svelte";
    import EditNameMode from "./blocks/EditInfo.svelte";
    import EditTimer from "./blocks/EditTimer.svelte";
    import Entry from "./blocks/Entry.svelte";


    // should be safe because if its on this page then it must have passed a list to do it.
    $: list = $popupPage.list!;

    function deleteEntry(index: number) {
        list.entries.removeEntry(index);
        list = list;
    }

    function addEntry() {
        dropdown.addEntry(list).then(() => list = list);
    }
    
</script>


{#if list !== null}

    

    <div class="edit">
        <h1>Name & Mode</h1>
        <div>
            <EditNameMode info={list.info} />
        </div>

        <h1>Timer</h1>
        <div>
            <EditTimer list={list} />
        </div>
    </div>

    

    <div class="entriesHeader">
        <h1>List Entries</h1>
        <TextButton isActive={!list.info.locked} onClick={addEntry}>Add Entry</TextButton>
    </div>

    <div class="entries">
        {#each list.entries.iterable as entry, i (entry)}
            <Entry entry={entry} deleteEntry={() => deleteEntry(i)}/>
        {:else}
             <div transition:fade|local={{duration: 100}}>No Entries</div>   
        {/each}
    </div>

    
{/if}

<div class="back">
    <TextButton onClick={() => popupPage.main()}>Back</TextButton>
</div>

<style>
    .edit {
        margin: 10px;
        margin-top: 0;
    }

    .edit div {
        margin-bottom: 10px;
    }

    .entries {
        padding: 10px;
        overflow-y: scroll;
        height: 100px;
        scrollbar-width: none;
        border: solid var(--border) 1px;
    }

    .entries div {
        text-align: center;
        color: var(--text);
        font-size: 15px;
        font-family: 'Roboto', sans-serif;
        
        position: relative;
        width: 100%;
        height: 0;
        top: 0;
        left: 0;
    }

    .entries::-webkit-scrollbar {
        display: none;
    }

    .entriesHeader {
        display: flex;
        justify-content: left;
        align-items: center;
        margin-bottom: 10px;
    }

    .entriesHeader h1 {
        margin: 0 10px;
        font-size: 18px;
    }

    

    h1 {
        color: var(--text);
        margin: 0;
        font-size: 13px;
        font-family: 'Roboto', sans-serif;
    }

    .back {
        float: right;
        margin-top: 10px;
        margin-right: 10px;
    }
</style>