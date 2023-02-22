
<script lang="ts">
    import { getStorageItem } from "../modules/storage";
    //import ActiveLists from "./components/ActiveLists.svelte";
    import ModeButton from "./components/ModeButton.svelte";
    import browser from 'webextension-polyfill';



    let promise = getStorageItem("infoList");

    function update() {
        promise = getStorageItem("infoList");
    }

    browser.storage.onChanged.addListener(update);
    

</script>


<div>
    {#await promise then infoList}
        <ModeButton {infoList} />
        <!-- <ActiveLists {infoList} /> -->
    {/await}
</div>



<style>
    div {
        display: flex;
        flex-direction: column;
        height: 400px;
        width: 300px;
    }
</style>

