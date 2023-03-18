<script lang="ts">
    import { onMount } from "svelte";
    import type Info from "../../../modules/info";
    import List from "../../../modules/list";
    import { addEntryPopupStore, currentUrlStore, popupPageStore, timerDisplayStore } from "../../../modules/store";
    import type { Options } from "../../../modules/types";
    import { handelError } from "../../../modules/util";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
  




    export let info: Info;

    let match: boolean = false;

    $: matchTitle = `Match Found: This list matched with ${List.clipURL("domain", $currentUrlStore)}`;
    const lockedTitle = "List Locked: This list has been locked, you will not be able to edit it in the popup";


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



    const options: Options = {
        buttons: {
            "Add Entry": {
                onClick: () => addEntryPopupStore.open(info.id),
                title: "Add a list entry"
            },

            "Edit List": {
                onClick: () => popupPageStore.list(info.id),
                title: "View List"
            }
        }
    }
    

</script>




<div class="main">

    <OptionsBlock options={options} lineColor={(info.active) ? "var(--text)" : "var(--textFade"}>
        <div class:active={info.active} class="infoButton">
            <button class:locked={info.locked} on:click={toggleActive}>{info.name}</button>

            <div class="spacer"></div>


            {#if info.useTimer}
                <div class="timer">
                    {$timerDisplayStore.get(info.timerId)}
                </div>
            {/if}


            <div class="indicators">
                <div class:invisible={!match} id="match" title={matchTitle}>M</div>
                <div class:invisible={!info.locked} id="lock" title={lockedTitle}>L</div>
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
        box-shadow: 0 2px var(--text);
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