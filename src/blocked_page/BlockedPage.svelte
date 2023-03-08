<script lang="ts">
    const blockedURL = new URLSearchParams(window.location.search).get("url");
</script>

<div id="background">

    <h1>YOU'VE BEEN BLOCKED BY JAMES</h1>
    <a href="{blockedURL}">{blockedURL}</a>

</div>


<style>

    :root {
        background-image: url("https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png");
        background-repeat: no-repeat;
    }

    a {
        display: block;
        font-size: 30px;
    }
</style>