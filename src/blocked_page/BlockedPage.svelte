<script lang="ts">
    import EntryControler from "../modules/entryControler";

    // the 'as string' is kinda scuffed but oh well
    const blockedURL = new URLSearchParams(window.location.search).get("url") as string;
</script>


<div class="main">
    <div class="info">
        <h2>This page has been blocked</h2>
        <a href="{blockedURL}">{`${EntryControler.clipURL("fullDomain", blockedURL)} : ${blockedURL}`}</a>
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
    }

    .info h2 {
        margin: 0;
    }
    
</style>