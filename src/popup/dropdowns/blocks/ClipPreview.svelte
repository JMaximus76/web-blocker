<script lang="ts">

    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import HorizontalScroll from "../../components/HorizontalScroll.svelte";
    import type { EntryMode } from "../../../modules/listComponets";
    import EntryController from "../../../modules/entryController";
    import type { Options } from "../../popupTypes";


    export let mode: EntryMode = "fullDomain";
    export let url: string;
    export let isValid: boolean;



    $: previewText = isValid? (EntryController.clipURL(mode, url) ?? "Invalid URL") : "Invalid URL";

    const options: Options = {
        radio: [
            {
                name: "Full Domain",
                value: "fullDomain",
                title: "Blocks all pages under the domain"
            },
            {
                name: "Domain",
                value: "domain",
                title: "Blocks specific subdomains ignoring other subdomains"
            },
            {
                name: "URL",
                value: "url",
                title: "Only blocks specified URL"
            },
            {
                name: "Exact",
                value: "exact",
                title: "Only blocks exact URL"
            }
        ]
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
    }

</style>