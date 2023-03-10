<script lang='ts'>
    import MainPage from "./pages/MainPage.svelte";
</script>




<div id="container">
    <MainPage />
</div>






<style>
    #container {
        height: 400px;
        width: 300px;
    }

    :global(body) {
        background: var(--background);
        overflow: hidden;
    }
</style>