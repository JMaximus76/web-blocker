<script lang="ts">
    import { onMount } from "svelte";
    import type { List } from "../../../modules/listComponets";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import type { Options } from "../../popupTypes";
    import { timerStore } from "../../../stores/dataStores";

    export let list: List;

    let minutesValue: string = (Math.floor(list.timer.max / 60000) % 60).toString();
    let hoursValue: string = Math.floor(Math.floor(list.timer.max / 60000) / 60).toString();


    onMount(() => {
        if (list.info.useTimer) {
            timerStore.setTimer(list.timer.id, list.timer.active, list.timer.timeLeft);
        }
    });

    function shiftMinutes() {
        let minutes = Number.parseInt(minutesValue);
        let hours = Number.parseInt(hoursValue);

        const overFlow = Math.floor(minutes / 60);
        minutes -= overFlow * 60;
        hours += overFlow;

        if (hours >= 24) {
            hours = 23;
            minutes = 59;
        }

        minutesValue = minutes.toString();
        hoursValue = hours.toString();
        return (hours * 60) + minutes;
    }

    function onBlur() {
        if (minutesValue === "") minutesValue = "0";
        if (hoursValue === "") hoursValue = "0";
    }

    function clear() {
        minutesValue = "0";
        hoursValue = "0";
        list.timer.max = 0;
        timerStore.setTimer(list.timer.id, list.timer.active, list.timer.timeLeft);
    }

    function toggleTimer() {
        list.info.useTimer = !list.info.useTimer;
    }
    

    let lineColor = "var(--neutral)";
    let textKey = "";

    $: if (hoursValue.match(/^\d+$/) === null || minutesValue.match(/^\d+$/) === null) {
        lineColor = "var(--invalid)";
        textKey = "letter";
    } else {
        lineColor = "var(--neutral)";
        textKey = "";
        list.timer.max = shiftMinutes();
        timerStore.setTimer(list.timer.id, list.timer.active, list.timer.timeLeft);
    }
    


    const options: Options = {
        buttons: [
            {
                name: "Toggle", 
                title: "Toggle the timer on or off",
                onClick: toggleTimer
            },
            {
                name: "Clear",
                title: "Clear the timer",
                onClick: clear
            }
        ],

        text: {
            entrys: {
                letter: {
                    text: "Invalid Character",
                    title: "Times can only have numbers in them"
                }
            }
        }
    }
</script>




<OptionsBlock options={options} enabled={!list.info.locked} bind:lineColor bind:textKey>
    <div class = "row">
        <button class="state clearButton" on:click={toggleTimer}>
            {list.info.useTimer ? "On" : "Off"}
        </button>

        <div class="time">
            <span>hour</span>
            <input 
                type="text" 
                bind:value={hoursValue} 
                disabled={list.info.locked}
                on:blur={onBlur}
                >
        </div>

        <div class="time">
            <span>min</span>
            <input 
                type="text" 
                bind:value={minutesValue} 
                disabled={list.info.locked}
                on:blur={onBlur}
                >
        </div>

        <div class="time">
            <span>left</span>
            <div>{$timerStore.get(list.timer.id)}</div>
        </div>

        
    </div>
</OptionsBlock>



<style>
    
    


    .row {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: baseline;

    }

    .row div:not(:last-child) {
        margin-right: 12px;
    }

    .state {
        width: 24px;
        margin-right: 20px;
        margin-left: 3px;
    }

    

    .time span {
        font-size: 13px;
        color: var(--text);
        margin-right: 2px;
        
    }

    .time div {
        display: inline;
        font-size: 15px;
    }

    .time input {
        width: 34px;
        font-size: 15px;
        font-family: 'Roboto', sans-serif;
        color: var(--text);
        border: none;
        outline: none;
        background-color: transparent;
        box-sizing: border-box;
        transition: background-color 0.3s;
    }

    

    

    .clearButton {
        background-color: transparent;
        border: none;

        padding: 0;
        color: inherit;
        font: inherit;
    }


    
</style>