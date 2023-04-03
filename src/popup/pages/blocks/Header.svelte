<script lang='ts'>
    import TextButton from "../../components/TextButton.svelte";
    import { popupPage } from "../../../stores/popupStateStores";
    import { storageStore } from "../../../stores/storageStores";
        
    export let showDeactivate: boolean;


    function deactivate(): void {
        $storageStore.runtimeSettings.isActive = false;
        popupPage.deactivated();
    }

</script>





<header>
    <div id="logo"></div>
    <h1>WebBlock _</h1>
    
    {#if showDeactivate}
        <div class="deactivate">
            <TextButton onClick={deactivate}>Deactivate</TextButton>
        </div>
    {/if}

</header>



<style>

    #logo {
        width: 27px;
        height: 27px;
        margin-right: 5px;
        background-image: url("../../../svg/logo.svg");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    .deactivate {
        margin-left: auto;
    }

    header {
        height: 50px;
        margin: 3px 3px 12px 7px;
        background-color: var(--background);
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;
    }


    h1 {
        font-size: 27px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
        margin: 0;
    }

   
</style>