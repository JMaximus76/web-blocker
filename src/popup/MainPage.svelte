<script lang="ts">
    import Header from "./components/Header.svelte";
    import Lists from "./components/Lists.svelte";
    import Button from "./components/Button.svelte";
    import { infoListStore, settingsStore } from "../modules/store"



    function toggleActiveMode(): void {
        $infoListStore.toggleActiveMode();
    }

    function toggleIsActive(): void {
        $settingsStore.toggleIsActive();
    }

</script>




{#if $settingsStore.isActive}
    <div id="main">
        <Header />

        <Button on:click={toggleActiveMode} name={"Change Mode"} fontSize={17} />
        <Button on:click={toggleIsActive} name={"Toggle Active"} fontSize={10} />

        <div id="lists">
            <Lists />
        </div>
    </div>
{:else}
    <h1>Extension is not currently active</h1>
    <Button on:click={toggleIsActive} name={"Toggle Active"} fontSize={10} />
{/if}


    

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