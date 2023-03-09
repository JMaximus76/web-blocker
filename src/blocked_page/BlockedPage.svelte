<script lang="ts">
    const blockedURL = new URLSearchParams(window.location.search).get("url");
</script>

<div id="body">

    <h2>YOU'VE BEEN BLOCKED BY JAMES</h2>
    <a href="{blockedURL}">{blockedURL}</a>

</div>


<style>

    :root {
        background-image: url("https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png");
        background-repeat: no-repeat;
    }

    a {
        font: sans-serif;
        display: block;
        font-size: 20px;
    }

    #body {
        font: sans-serif;
    }
</style>