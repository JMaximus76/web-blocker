
<script lang="ts">
    import type { EntryMode } from "../../modules/types";


    export let mode: EntryMode = "fullDomain";
</script>




<div id="main">
    <label title="Fully blocks the domain">
        <input type=radio bind:group={mode} name="mode" value={"fullDomain"}>
        <div>Full Domain</div>
    </label>
    
    <label title="Fully blocks all pages under the subdomain">
        <input type=radio bind:group={mode} name="mode" value={"domain"}>
        <div>Domain</div>
    </label>
    
    <label title="Only blocks specified URL">
        <input type=radio bind:group={mode} name="mode" value={"url"}>
        <div>URL</div>
    </label>
    
    <label title="Only blocks exact URL">
        <input type=radio bind:group={mode} name="mode" value={"exact"}>
        <div>Exact</div>
    </label>
</div>






<style>

    label {
        font-size: 10px;
        font-family: 'Roboto', sans-serif;
        color: var(--textFade);
        margin-right: 7px;
        
    }

    input {
        display: none;
    }

    div {
        cursor: pointer;
        display: inline;
        transition: color 0.2s;
    }


    input:checked + div {
        color: var(--text);
    }

    #main {
        cursor: default;
    }




</style>