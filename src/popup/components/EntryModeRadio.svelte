
<script lang="ts">
    import type { EntryMode } from "../../modules/types";


    export let mode: EntryMode = "fullDomain";
</script>




<div id="main">
    <label title="The full website domain will be blocked">
        <input type=radio bind:group={mode} name="mode" value={"fullDomain"}>
        <div>Full Domain</div>
    </label>
    
    <label title="Blocks all pages under a subdomain">
        <input type=radio bind:group={mode} name="mode" value={"domain"}>
        <div>Domain</div>
    </label>
    
    <label title="Blocks specified URL (excludes query parmeters and anchors)">
        <input type=radio bind:group={mode} name="mode" value={"url"}>
        <div>URL</div>
    </label>
    
    <label title="Blocks exact URL (inclues query parmeters and anchors)">
        <input type=radio bind:group={mode} name="mode" value={"exact"}>
        <div>Exact</div>
    </label>
</div>






<style>

    label {
        font-size: 10px;
        font-family: 'Roboto', sans-serif;
        color: var(--textFade);
        margin-right: 5px;
    }

    input {
        display: none;
    }

    div {
        cursor: default;
        display: inline;
    }


    input:checked + div {
        color: var(--text);
    }

    #main {
        display: felx;
        flex-direction: row;
    }




</style>