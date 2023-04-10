<script lang="ts">
    import ClipPreview from "./blocks/ClipPreview.svelte";
    import InputUrl from "./blocks/InputURL.svelte";
    import TextButton from "../components/TextButton.svelte";
    import type { EntryMode } from "../../modules/listComponets";
    import { dropdown } from "../../stores/popupStateStores";
    import DropdownContainer from "./blocks/DropdownContainer.svelte";
    import Exit from "./blocks/Exit.svelte";
    import { sendMessage } from "../../modules/util";


    let url: string;
    let mode: EntryMode;
    let isValid: boolean;

    // should work but it might be null ?? but it also should be an list.
    let list = $dropdown.list!;

    let addButtonTitle = `Add new entry to ${list.info.name}`;

    function addEntry() {
        if (isValid) {
            list.entrys.addEntry(mode, url);
            sendMessage("currentUrlStore", "update", null);
            dropdown.close();
        }
    }

</script>


<DropdownContainer>
    <Exit/>

    <h1>Add List Entry</h1>
    

    

    <div class="input">
        <InputUrl bind:isValid bind:value={url}/>
    </div>

    <div class="mode">
        <ClipPreview bind:isValid bind:mode url={url}/>
    </div>

    

    <div class="add" title={addButtonTitle}>
        <TextButton isActive={isValid} onClick={addEntry}>Add Entry</TextButton>
        <h2>{list.info.name}</h2>
    </div>
</DropdownContainer>


<style>
    h1 {
        margin: 0;
        margin-bottom: 10px;
        font-size: 21px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
    }

    .input {
        margin-bottom: 10px;
    }

    .mode {
        margin-top: 15px;
    }

    .add {
        margin-top: 25px;
        float: left;
        display: flex;
        align-items: center;
    }

    .add h2{
        margin: 0 0 0 7px;
        font-size: 16px;
        font-family: 'Roboto', sans-serif;
        font-weight: normal;
        color: var(--text);
    }
</style>