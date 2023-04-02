<script lang="ts">
    import type { List } from "../../modules/listComponets";
    import { dropdown, popupPage } from "../../stores/popupStateStores";
    import TextButton from "../components/TextButton.svelte";
    import EditNameMode from "./blocks/EditInfo.svelte";
    import EditTimer from "./blocks/EditTimer.svelte";
    import Entry from "./blocks/Entry.svelte";


    // should be safe because if its on this page then it must have passed a list to do it.
    $: list = $popupPage.list as List;


    
</script>


{#if list !== null}

    <div class="buttons">
        

        <div>
            <TextButton isActive={!list.info.locked} onClick={() => dropdown.addEntry(list)}>
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
        {#each list.entrys.list as entry}
            <Entry entry={entry} />
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