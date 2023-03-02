<script lang="ts">
    import Header from "./components/Header.svelte";
    import Lists from "./components/Lists.svelte";
    import Button from "./components/Button.svelte";
    import { infoListStore } from "../modules/store"



    

</script>





<div id="main">
    <Header />

                                    <!-- should change to take any type of sizing px, %, em, etc. -->
    <Button on:click={$infoListStore.toggleActiveMode} name={"Change Mode"} fontSize={17}/>
    <div id="lists">
        <Lists />
    </div>
</div>

    

<style>

    #main {
        background-color: transparent;
        height: 100%;
        width: 100%;
        display: inline-block;
    }

    #lists {
        box-sizing: border-box;
        height: 200px;
        width: 100%;
        margin: 10px 0px;
    }

    


</style>