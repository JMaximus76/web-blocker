<script lang="ts">
    import { onMount } from "svelte";
    import type Info from "../../modules/info";
    import List from "../../modules/list";
    import { addEntryPopupStore, currentUrlStore, timerDisplayStore } from "../../modules/store";
    import { handelError } from "../../modules/util";
  




    export let info: Info;

    let match: boolean = false;

    $: matchTitle = `Match Found: This list matched with ${List.clipURL("domain", $currentUrlStore)}`;


    const lockedTitle = "List Locked: This list has been locked, you will not be able to edit it in the popup";
    const addTitle = "Add a list entry";
    const editTitle = "Edit List";


    function toggleActive(): void {
        if (info.locked) return;
        info.toggleActive();
    }

    onMount(() => {
        if (info.useTimer) {
            info.pullTimer().then((timer) => {
                timerDisplayStore.addTimer(timer);
            }).catch(handelError);
        }
        
        info.pullList().then((list) => {
            match = list.check($currentUrlStore);
        }).catch(handelError);

    });

    

</script>




<div id="main">
    <div class:active={info.active} id="infoButton">


        <button class:locked={info.locked} on:click={toggleActive}>{info.name}</button>

        <div id="spacer"></div>


        {#if info.useTimer}
            <div id="timer">
                {$timerDisplayStore.get(info.timerId)}
            </div>
        {/if}


        <div id="indicators">
            <div class:invisible={!match} id="match" title={matchTitle}>M</div>
            <div class:invisible={!info.locked} id="lock" title={lockedTitle}>L</div>
        </div>


        
    </div>


    <div id="buttons">
        <button on:click={() => addEntryPopupStore.open(info.id)} title={addTitle}>Add Entry</button>
        <button class:locked={info.locked} title={editTitle}>Edit List</button>
    </div>


</div>



<style>
 
    




    #main {
        box-sizing: content-box;
        width: 250px;
        margin-bottom: 7px;
        background-color: transparent;
    }



    #infoButton {
        display: flex;
        flex-direction: row;        
        box-shadow: 0 2px var(--textFade);
        transition: box-shadow 0.3s;
        
    }

    #infoButton button {
        padding: 0;
        border: none;
        width: 100%;
        cursor: pointer;
        font-family: 'Roboto', sans-serif;
        font-size: 17px;
        color: var(--textFade);
        text-align: left;
        transition: color 0.3s;
    }

    #infoButton button.locked {
        cursor: default;
    }

    #infoButton.active {
        color: var(--text);
        box-shadow: 0 2px var(--text);
    }

    #infoButton.active button {
        color: var(--text);
    }

    #buttons button {
        border: none;
        font-size: 10px;
        color: var(--textFade);
        font-family: 'Roboto', sans-serif;
        cursor: pointer;
        transition: color 0.2s;
        padding: 0;
        margin-right: 8px;
    }

    #buttons button:hover {
        color: var(--text);
    }

    #buttons button.locked {
        cursor: default;
    }

    #buttons button.locked:hover {
        color: var(--textFade);
    }



    #indicators {
        margin-left: 4px;
        margin-top: auto;
        display: flex;
        flex-direction: row-reverse;
        cursor: default;
        width: 45px;
    }
    #match, #lock {
        font-family: 'Tilt Neon', cursive;
        font-size: 13px;
        margin: 0 5px;
    }
    #match {
        color: var(--darkBlue);
    }
    #lock {
        color: var(--lightRed);
    }
    .invisible {
        display: none;
    }


    #spacer {
        margin-left: auto;
    }
    #timer {
        font-style: italic;
        font-size: 14px;
        margin-top: auto;
        color: var(--textFade);
        transition: color 0.3s;
        font-family: 'Roboto', sans-serif; 
        margin-right: 5px;
    }

    #infoButton.active #timer {
        color: var(--text);
    }
    
    button {
        background-color: transparent;
    }



</style>