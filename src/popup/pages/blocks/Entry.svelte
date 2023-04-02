<script lang="ts">
    import { Entry, EntryMode } from "../../../modules/listComponets";
    import HorizontalScroll from "../../components/HorizontalScroll.svelte";


    export let entry: Entry;


    function prettyMode(mode: EntryMode) {
        switch (mode) {
            case "domain": return "Domain";
            case "exact": return "Exact";
            case "fullDomain": return "Full Domain";
            case "url": return "URL";
        }
    }

    function nextMode() {
        switch (entry.mode) {
            case "fullDomain":
                entry.mode = "domain";
                break;

            case "domain":
                entry.mode = "url";
                break;

            case "url":
                entry.mode = "exact";
                break;

            case "exact":
                entry.mode = "fullDomain";
                break;
        }

        entry = entry;
    }

    


    

</script>



<div class="entry">
    <button on:click={() => nextMode()}>{prettyMode(entry.mode)}</button>

    <div>
        <HorizontalScroll>{entry.cliped}</HorizontalScroll>
    </div>
</div>


<style>
    .entry {
        display: flex;
        color: var(--text);
        font-family: 'Roboto', sans-serif;
        font-size: 13px;
    }

    .entry button {
        margin: 0;
        margin-right: 10px;
        width: 70px;
        cursor: pointer;

        padding: 0;
        border: none;
        background-color: transparent;
        text-align: inherit;
        color: inherit;
        font-size: inherit
    }

    .entry div {
        width: 200px;
    }
</style>