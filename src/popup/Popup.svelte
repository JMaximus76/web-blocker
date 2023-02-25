





<script lang='ts'>
    import MainPage from "./MainPage.svelte";
</script>


<div id="container">
    <MainPage />
</div>




<style>
    #container {
        height: 400px;
        width: 300px;
        padding: 13px;
        
    }

    :global(body) {
        background: var(--backgroundColor);
    }
</style>