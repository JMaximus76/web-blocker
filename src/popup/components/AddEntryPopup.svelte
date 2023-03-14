
<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import type Info from "../../modules/info";
    import { addEntryPopupStore, infoListStore } from "../../modules/store";
    import InputUrl from "./InputURL.svelte";

    

    let info: Info | undefined = undefined;

    $: {
        const infoId = $addEntryPopupStore.infoId;
        if (infoId === null) {
            info = undefined
        } else {
            info = $infoListStore.getInfoWithId(infoId);
        }
    }


</script>




{#if $addEntryPopupStore.active}

    <button on:click={addEntryPopupStore.close} transition:fade={{duration: 200}} id="blur"></button>

    {#if info === undefined}
        <div id="error">
            <h1>ERROR</h1>
        </div>
    {:else}


        <div transition:fly={{y: -200, duration: 200}} id="main">

            <h1>Adding To:</h1>
            <p>{info.name}</p>

            
            <InputUrl />



        </div>


    {/if}
{/if}


<style>
    #main h1 {
        margin: 0;
        font-size: 21px;

        font-family: 'Roboto', sans-serif;
        color: var(--text);
    }

    #main p {
        margin: 0;
        margin-top: 4px;
        font-size: 18px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
    }




    #main {
        height: 200px;
        width: 250px;
        padding: 10px;

        box-sizing: border-box;

        position: absolute;
        top: 100px;
        left: calc((316px - 250px) / 2);


        background-color: var(--popup);
        border-radius: var(--radius);
        
    }

    #blur {
        margin: 0;
        padding: 0;
        border: none;
        background-color: transparent;
        height: 416px;
        width: 316px;
        position: absolute;
        top: 0px;
        left: 0px;  
    }



    #error {
        color: red;
    }

</style>