<script lang="ts">
    import { onMount } from "svelte";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import type { List } from "../../../modules/listComponets";
    import EntryController from "../../../modules/entryController";
    import { currentUrlStore, timerStore } from "../../../stores/dataStores";
    import { dropdown, popupPage } from "../../../stores/popupStateStores";
    import type { Options } from "../../popupTypes";




    export let list: List;




    $: match = list.entrys.check($currentUrlStore);
    $: matchTitle = `Match Found: This list matched with ${EntryController.clipURL("domain", $currentUrlStore)}`;
    const lockedTitle = "List Locked: This list has been locked, you will not be able to edit it in the popup";


    function toggleActive(): void {
        if (list.info.locked) return;
        list.info.active = !list.info.active;
    }

    onMount(() => {
        if (list.info.useTimer) {
            timerStore.setTimer(list.timer.id, list.timer.active, list.timer.timeLeft);
        }
    });



    


    const options: Options = {
        buttons: [
            {
                name: "Power",
                onClick: toggleActive,
                title: "Toggles the list on and off"
            },
            {
                name: "Quicik Add",
                onClick: () => dropdown.addEntry(list, true).then(() => match = list.entrys.check($currentUrlStore)),
                title: "Add a list entry"
            },
            {
                name: "Toggle Timer",
                onClick: () => list.info.useTimer = !list.info.useTimer,
                title: "Toggles the timer on and off"
            }  
        ],

        text: {
            entrys: {
                on: {
                    text: "On",
                    color: "var(--blue)"
                },
                off: {
                    text: "Off",
                    color: "var(--lightRed)"
                }
            }
        }
    }


    $: textKey = (list.info.active) ? "on" : "off";

</script>




<div class="main">

    <OptionsBlock bind:textKey options={options}>
        <div class="infoButton">
            <button title="Edit List" on:click={() => popupPage.list(list)}>{list.info.name}</button>

            <div class="spacer"></div>


            {#if list.info.useTimer}
                <div class="timer">
                    {$timerStore.get(list.info.id, true)}
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
        color: var(--text);
        text-align: left;
        transition: color 0.3s;
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
        color: var(--text);
        transition: color 0.3s;
        font-family: 'Roboto', sans-serif; 
        margin-right: 5px;
    }

    
    button {
        background-color: transparent;
        color: var(--text);
    }



</style>