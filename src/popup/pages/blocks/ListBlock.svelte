<script lang="ts">
    import { onMount } from "svelte";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import type { List } from "../../../modules/listComponets";
    import EntryControler from "../../../modules/entryControler";
    import { currentUrlStore, timerStore } from "../../../stores/dataStores";
    import { dropdown, popupPage } from "../../../stores/popupStateStores";
    import type { Options } from "../../popupTypes";
    import { storageStore } from "../../../stores/storageStores";




    export let list: List;




    $: match = list.entrys.check($currentUrlStore);
    $: matchTitle = `Match Found: This list matched with ${EntryControler.clipURL("domain", $currentUrlStore)}`;
    const lockedTitle = "List Locked: This list has been locked, you will not be able to edit it in the popup";


    function toggleActive(): void {
        if (list.info.locked) return;
        list.info.active = !list.info.active;
    }

    onMount(() => {
        if (list.info.useTimer) {
            timerStore.addTimer(list.timer.id, list.timer.active, list.timer.timeLeft);
        }
    });



    


    const options: Options = {
        buttons: [
            {
                name: "Add Entry",
                onClick: () => dropdown.addEntry(list),
                title: "Add a list entry"
            },
            {
                name: "Delete",
                onClick: () => dropdown.confirm(() => storageStore.deleteList(list.info.id), `Delete ${list.info.name}`),
                title: "Deletes the list"
            },
            {
                name: `${(list.info.locked ? "View" : "Edit")} List`,
                onClick: () => popupPage.list(list),
                title: "View List"
            },
            
        ]
    }


    $: lineColor = (list.info.active) ? "var(--text)" : "var(--textFade)";

</script>




<div class="main">

    <OptionsBlock options={options} bind:lineColor>
        <div class:active={list.info.active} class="infoButton">
            <button class:locked={list.info.locked} on:click={toggleActive}>{list.info.name}</button>

            <div class="spacer"></div>


            {#if list.info.useTimer}
                <div class="timer">
                    {$timerStore.get(list.info.id)}
                </div>
            {/if}


            <div class="indicators">
                <div class:invisible={!match} id="match" title={matchTitle}>M</div>
                <div class:invisible={!list.info.locked} id="lock" title={lockedTitle}>L</div>
            </div>

        </div>
    </OptionsBlock>


</div>



<style>
 
    




    .main {
        box-sizing: content-box;
        width: 275px;
        margin-bottom: 7px;
        background-color: transparent;
    }



    .infoButton {
        display: flex;
        flex-direction: row;        
    }

    .infoButton button {
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

    .infoButton button.locked {
        cursor: default;
    }

    .infoButton.active {
        color: var(--text);
    }

    .infoButton.active button {
        color: var(--text);
    }


    .indicators {
        margin-left: 4px;
        margin-top: auto;
        display: flex;
        flex-direction: row-reverse;
        cursor: default;
        width: 45px;
    }
    .indicators div {
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


    .spacer {
        margin-left: auto;
    }
    .timer {
        font-style: italic;
        font-size: 14px;
        margin-top: auto;
        color: var(--textFade);
        transition: color 0.3s;
        font-family: 'Roboto', sans-serif; 
        margin-right: 5px;
    }

    .infoButton.active .timer {
        color: var(--text);
    }
    
    button {
        background-color: transparent;
    }



</style>