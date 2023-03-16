
<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import type Info from "../../modules/info";
    import List from "../../modules/list";
    import { addEntryPopupStore, infoListStore } from "../../modules/store";
    import type { EntryMode } from "../../modules/types";
    import ClipPreview from "../components/ClipPreview.svelte";
    import InputUrl from "../components/InputURL.svelte";
    import TextButton from "../components/TextButton.svelte";
    

    let url: string;
    let mode: EntryMode;
    let isValid: boolean;

    let info: Info | undefined = undefined;

    $: {
        const infoId = $addEntryPopupStore.infoId;
        if (infoId === null) {
            info = undefined
        } else {
            info = $infoListStore.getInfoWithId(infoId);
        }
    }

    let addButtonTitle: string;


    onMount(() => {
        if (info !== undefined) {
            addButtonTitle = `Add new entry to ${info.name}`;
        }
    });


    function addEntry() {
        if (info !== undefined && isValid) {
            info.pullList().then((list) => {
                list.addEntry(List.createEntry(mode, url));
                return list.save();
            }).then(() => {
                addEntryPopupStore.close();
            });
        }
    }

</script>






<button on:click={addEntryPopupStore.close} transition:fade={{duration: 200}} id="close"></button>

{#if info === undefined}
    <div id="error">
        <h1>ERROR</h1>
    </div>
{:else}


    <div transition:fly={{y: -400, duration: 300}} id="main">

        <h1>Add List Entry:</h1>
        <h2>{info.name}</h2>

        <div id="input">
            <InputUrl bind:isValid bind:value={url}/>
        </div>

        <div id="mode">
            <ClipPreview bind:mode url={url}/>
        </div>

        <div id="button" title={addButtonTitle  }>
            <TextButton on:click={addEntry} text={"Add"} fontSize={"14px"} horizontalPadding={"12px"} verticalPadding={"4px"}/>
        </div>
    </div>


{/if}



<style>
    #main h1 {
        margin: 0;
        margin-bottom: 10px;
        font-size: 21px;

        font-family: 'Roboto', sans-serif;
        color: var(--text);
    }

    #main h2 {
        margin: 5px 0;
        margin-bottom: 8px;
        font-size: 19px;
        font-family: 'Roboto', sans-serif;
        font-style: italic;
        font-weight: normal;
        color: var(--text);
    }


    #input {
        margin-bottom: 10px;

    }

    #mode {
        margin-top: 25px;
    }

    #main {
        height: 240px;
        width: 290px;
        padding: 10px;

        box-sizing: border-box;

        position: absolute;
        top: 65px;
        left: calc((316px - 290px) / 2);


        background-color: var(--popup);
        border-radius: var(--radius);
        
    }

    #close {
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


    #button {
        margin-top: 11px;
        float: right;
    }
   

    #error {
        color: red;
    }

</style>