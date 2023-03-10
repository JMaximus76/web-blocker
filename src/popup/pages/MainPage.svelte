<script lang="ts">
    import Header from "../components/Header.svelte";
    import Lists from "../components/Lists.svelte";
    import TextButton from "../components/TextButton.svelte";
    import { infoListStore, settingsStore } from "../../modules/store"



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

        <TextButton on:click={toggleActiveMode} text={"Change Mode"} />
        <TextButton on:click={toggleIsActive} text={"Toggle Active"} />


        <div id="lists">
            <Lists />
        </div>

    </div>
{:else}
    <h1>Extension is not currently active</h1>
    <TextButton on:click={toggleIsActive} text={"Toggle Active"} />
{/if}


    

<style>

    #main {
        background-color: transparent;
        height: 100%;
        width: 100%;
        display: inline-block;
    }

    #lists {
        display: inline-block;
        height: 230px;
        width: 100%;
        margin: 10px 0px;
    }

    


</style>