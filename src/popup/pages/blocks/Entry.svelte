<script lang="ts">
    import type { Entry, EntryMode } from "../../../modules/listComponets";
    import HorizontalScroll from "../../components/HorizontalScroll.svelte";
    import { fade } from 'svelte/transition';

    export let entry: Entry;
    export let deleteEntry: () => void;


    const modeTitleLookup: {[key in EntryMode]: string} = {
        domain: "Domain: Blocks specific subdomain ingnoring other subdomains",
        fullDomain: "Full Domain: Blocks all pages under the domain",
        url: "URL: Only blocks specified URL",
        exact: "Exact: Only blocks exact URL"
    }

    function prettyMode(mode: EntryMode) {
        switch (mode) {
            case "domain": return "Domain";
            case "exact": return "Exact";
            case "fullDomain": return "Full";
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



<div class="entry" out:fade={{duration: 150}}>
    <button title={modeTitleLookup[entry.mode]} on:click={() => nextMode()}>{prettyMode(entry.mode)}</button>

    <div>
        <HorizontalScroll>{entry.cliped}</HorizontalScroll>
    </div>

    <button on:click={deleteEntry} class="delete" title="Delete Entry">X</button>
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
        width: 53px;
        cursor: pointer;

        padding: 0;
        border: none;
        background-color: transparent;
        text-align: inherit;
        color: inherit;
        font-size: inherit
    }

    .entry div {
        width: 196px;
    }


    .entry button.delete {
        color: var(--textFade);
        transition: color 0.3s;
        width: auto;
        margin: 0;
        margin-left: auto;
    }

    .entry button.delete:hover {
        color: var(--text);
    }
</style>