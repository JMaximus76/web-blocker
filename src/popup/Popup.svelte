<script lang='ts'>
    //import { infoListStore } from "../modules/store";
    import MainPage from "./MainPage.svelte";
    
    // $: {
    //     console.log("----------infoList update in popup----------");
    //     console.table($infoListStore.storage);
    // }

    
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
        background: var(--background);
    }
</style>