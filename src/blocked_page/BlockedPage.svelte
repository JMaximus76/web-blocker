<script lang="ts">
    import EntryWrapper from "../modules/wrappers/entryWrapper";
    import { trimLength } from "../modules/util";

    // the 'as string' is kinda scuffed but oh well
    const blockedURL = new URLSearchParams(window.location.search).get("url") as string;


    
</script>


<div class="main">
    <div class="info">
        <h2>This page has been blocked</h2>
        <a href="{blockedURL}">{`${EntryWrapper.clipURL("domain", blockedURL)} : ${trimLength(blockedURL, 60)}`}</a>
    </div>
</div>

<style>

    :root {
        background-color: var(--blockedPageBackground);
        background-repeat: no-repeat;
    }

    .main {
        text-align: center;
    }

    .info {
        font-family: 'Roboto', sans-serif;
        font-size: 32px;
        display: inline-block;
        color: var(--text);
        padding: 30px;
        border: solid var(--border) 1px;
        margin-top: 180px;
    }

    .info * {
        font: inherit;
        color: inherit;
        text-decoration: none;
        transition: box-shadow 0.3s;
    }

    .info a:hover {
        box-shadow: 0 2px 0 0 var(--text);
    }

    .info h2 {
        margin: 0;
    }
    
</style>