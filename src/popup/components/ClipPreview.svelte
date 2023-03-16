
<script lang="ts">
    import List from "../../modules/list";
    import type { EntryMode } from "../../modules/types";
    import { isBadURL } from "../../modules/util";
    import EntryModeRadio from "./EntryModeRadio.svelte";



    export let mode: EntryMode;
    export let url: string;


    function generatePreviewText(mode: EntryMode, url: string): string {
        
        if (mode === "exact") {
            if (isBadURL(url)) {
                return url;
            } else {
                return "Invalid URL";
            }
        }


        const clip = List.clipURL(mode, url);
        if (clip === null || clip === "") {
            return "Invalid URL";
        } else {
            return clip;
        }
    }

    $: previewText = generatePreviewText(mode, url);


</script>


<h2>Preview</h2>
<p>{previewText}</p>
<EntryModeRadio bind:mode={mode}/>




<style>

    h2 {
        font-size: 10px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 0;
        margin-top: 3px;
        font-weight: normal;
    }

    p {
        font-size: 13px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 0;
        height: 1em;
        width: 100%;
        box-shadow: 0 2px var(--neutral);
        padding: 5px;
        padding-left: 0;
    }

</style>