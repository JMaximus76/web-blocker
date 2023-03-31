
<script lang="ts">
    import TextButton from "../components/TextButton.svelte";
    import { popupPageStore } from "../../modules/stores/popupStateStores";
    import { storageStore } from "../../modules/stores/storageStores";



    function activate(): void {
        $storageStore.runtimeSettings.isActive = true;
        popupPageStore.main();
    }
</script>









{#if $storageStore.ready}
    <div id="main">
        <h1>The Extension is Deactivated</h1>
        <TextButton onClick={activate}>Activate</TextButton>
    </div>
{/if}

<style>

    #main {
        text-align: center;
    }

    h1 {
        color: var(--text);
        font-family: 'Roboto', sans-serif;
        text-align: center;
        margin-bottom: 70px;
    }


</style>