
<script lang="ts">
    import TextButton from "../components/TextButton.svelte";
    import { popupPageStore } from "../../modules/stores/popupState";
    import { itemStore } from "../../modules/stores/server";


    function toggleIsActive<T extends {isActive: boolean;}>(runtimeSettings: T): void {
        runtimeSettings.isActive = false;
        popupPageStore.deactivated();
    }
</script>









{#await $itemStore.get("runtimeSettings") then rts}
    <div id="main">
        <h1>The Extension is Deactivated</h1>
        <TextButton on:click={() => toggleIsActive(rts)} text={"Activate"} />
    </div>
{/await}

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