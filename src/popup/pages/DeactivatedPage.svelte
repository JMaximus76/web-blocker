
<script lang="ts">
    import TextButton from "../components/TextButton.svelte";
    import { popupPageStore, settingsStore } from "../../modules/store";


    function toggleIsActive(): void {
        popupPageStore.goto("main");
        $settingsStore.toggleIsActive();
    }
</script>










<div id="main">
    <h1>The Extension is Deactivated</h1>
    <TextButton on:click={toggleIsActive} text={"Activate"} />
</div>


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