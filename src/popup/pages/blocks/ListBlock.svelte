<script lang="ts">
    import { onMount } from "svelte";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import type { List } from "../../../modules/listComponets";
    import EntryController from "../../../modules/entryController";
    import { currentUrlStore, timerStore } from "../../../stores/dataStores";
    import { dropdown, popupPage } from "../../../stores/popupStateStores";
    import type { Options } from "../../popupTypes";

    
    export let list: List;


    function toggleActive(): void {
        if (list.info.locked) return;
        list.info.active = !list.info.active;
    }

    onMount(() => {
        if (list.info.useTimer) {
            timerStore.setTimer(list.timer);
        }
    });



    
    function buildOptions() {
        const options: Options = {}

        if (!list.info.locked) {
            options.buttons = [
                {
                    name: "On/Off",
                    onClick: toggleActive,
                    title: "Toggles the list on and off"
                },
                {
                    name: "Quick Add",
                    onClick: () => dropdown.addEntry(list, true).then(() => match = list.entrys.check($currentUrlStore)),
                    title: "Add a list entry"
                },
                {
                    name: "Toggle Timer",
                    onClick: () => {
                        list.info.useTimer = !list.info.useTimer;
                        timerStore.setTimer(list.timer);
                    },
                    title: "Toggles the timer on and off"
                }  
            ]
        }

        options.text = {
            entrys: {
                on: {
                    text: "On",
                    color: "var(--blue)"
                },
                off: {
                    text: "Off",
                    color: "var(--lightRed)"
                },
                locked: {
                    text: "Locked",
                    color: "var(--red)",
                    title: "List Locked: This list has been locked, you will not be able to edit it in the popup"
                },
                match: {
                    text: "Match",
                    color: "var(--orange)",
                    title: `Match Found: This list matched with ${EntryController.clipURL("domain", $currentUrlStore)}`
                },
                scheduled: {
                    text: "Scheduled",
                    color: "var(--purple)"
                }
            }
        }

        return options;
    }

    $: match = list.entrys.check($currentUrlStore);

    let textKeys: string[] = [];

    $: {
        textKeys.length = 0;
        textKeys.push(list.info.active ? "on" : "off");
        if (list.info.locked) textKeys.push("locked");
        if (match) textKeys.push("match")
    }
    

</script>




<div class="main">

    <OptionsBlock bind:textKeys options={buildOptions()}>
        <div class="infoButton">
            <button title="Edit List" on:click={() => popupPage.list(list)}>{list.info.name}</button>

            <div class="spacer"></div>


            {#if list.info.useTimer}
                <div class="timer">
                    {$timerStore.get(list.info.id, "remaining")}
                </div>
            {/if}


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