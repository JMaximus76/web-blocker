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
        list.entrys.removeEntry(index);
        list = list;
    }

    function addEntry() {
        dropdown.addEntry(list).then(() => list = list);
    }
    
</script>


{#if list !== null}

    <div class="buttons">
        

        <div>
            <TextButton isActive={!list.info.locked} onClick={addEntry}>
                Add Entry
            </TextButton>
        </div>
    </div>

    <div class="edit">
        <div>
            <EditNameMode info={list.info} />
        </div>

        <div>
            <EditTimer list={list} />
        </div>
    </div>

    <div class="entrys">
        {#if list.entrys.list.length === 0}
            <div transition:fade|local>No Entrys</div>
        {/if}

        {#each list.entrys.list as entry, i (entry.id)}
            <Entry entry={entry} deleteEntry={() => deleteEntry(i)}/>
        {/each}
        
    </div>

    
{/if}

<TextButton onClick={() => popupPage.main()}>
    Back
</TextButton>

<style>
    .edit {
        padding: 10px;
    }

    .edit div {
        margin-bottom: 10px;
    }

    .entrys {
        padding: 10px;
        overflow-y: scroll;
        height: 100px;
        scrollbar-width: none;
        border: solid var(--border) 1px;
    }

    .entrys div {
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

    .entrys::-webkit-scrollbar {
        display: none;
    }

    .buttons {
        display: flex;
        justify-content: left;
    }

    .buttons div {
        margin: 0 10px;
    }
</style>