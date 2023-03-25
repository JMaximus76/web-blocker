<script lang="ts">

    import { isBadURL } from "../../../modules/util";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import HorizontalScroll from "../../components/HorizontalScroll.svelte";
    import type { EntryMode } from "../../../modules/listComponets";
    import EntryControler from "../../../modules/entryControler";
    import type { Options } from "../../popupTypes";


    export let mode: EntryMode = "fullDomain";
    export let url: string;



    function generatePreviewText(mode: EntryMode, url: string): string {
        
        if (mode === "exact") {
            if (isBadURL(url)) {
                return url;
            } else {
                return "Invalid URL";
            }
        }

        const clip = EntryControler.clipURL(mode, url);
        if (clip === null || clip === "") {
            return "Invalid URL";
        } else {
            return clip;
        }
    }

    $: previewText = generatePreviewText(mode, url);

    const options: Options = {
        radio: {
            "Full Domain": {
                value: "fullDomain",
                title: "Fully blocks the domain"
            },

            "Domain": {
                value: "domain",
                title: "Fully blocks all pages under the subdomain"
            },

            "URL": {
                value: "url",
                title: "Only blocks specified URL"
            },

            "Exact": {
                value: "exact",
                title: "Only blocks exact URL"
            }
        }
    }




</script>


<h2>Preview</h2>

<OptionsBlock options={options} bind:radioValue={mode}>
    

    <HorizontalScroll>
        <div class="preview">{previewText}</div>
    </HorizontalScroll>
</OptionsBlock>



<style>

    h2 {
        font-size: 13px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 3px 0 0 0;
        font-weight: normal;
    }

   

    .preview {
        font-size: 14px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 0;
        padding: 2px 5px 2px 2px;
        white-space: nowrap;
    }

</style>