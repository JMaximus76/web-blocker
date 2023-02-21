
<script>
    import { getActiveInfos, getStorageItem, togleActiveMode } from "../modules/storage";
    import browser from "webextension-polyfill";



    let promise = getStorageItem("infoList");


    async function changeMode() {
        await togleActiveMode();
        promise = getStorageItem("infoList");
    }

</script>

{#await promise}
    <p>...waiting</p>
{:then infoList}
    <button on:click={changeMode}>Change Mode</button>
    
    <h3>Current Lists</h3>
    {#each infoList[infoList.activeMode] as info}
        <p>{info.name}</p>
    {/each}
    
{/await}
