<script lang="ts">
    import { List } from "../../../modules/listComponets";
    import { formatTime } from "../../../modules/util";
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import { Options } from "../../popupTypes";

    export let list: List;

    let minutesValue: string = (Math.floor(list.timer.max / 60000) % 60).toString();
    let hoursValue: string = Math.floor(Math.floor(list.timer.max / 60000) / 60).toString();
    //let isValid = true;
    

    function shiftMinutes(minutes: number, hours: number) {
        let newHours = hours + Math.floor(minutes / 60);
        let newMinutes = minutes % 60;
        if (newHours >= 24) {
            newHours = 23;
            newMinutes = 59;
        }

        minutesValue = newMinutes.toString();
        hoursValue = newHours.toString();

        return (newHours * 60) + newMinutes;
    }

    function onBlur() {
        if (minutesValue === "") minutesValue = "0";
        if (hoursValue === "") hoursValue = "0";

        // if (isValid) {
        //     const minutes = Number.parseInt(minutesValue);
        //     const hours = Number.parseInt(hoursValue);
        //     list.timer.max = shiftMinutes(minutes, hours);
        // }
    }

    function clear() {
        minutesValue = "0";
        hoursValue = "0";
        list.timer.max = 0;
    }

    

    let lineColor = "var(--neutral)";
    let textKey = "";

    $: {
        if (minutesValue.match(/^\d+$/) === null || hoursValue.match(/^\d+$/) === null) {
            lineColor = "var(--invalid)";
            textKey = "letter";
        } else {
            lineColor = "var(--neutral)";
            textKey = "";
            list.timer.max = shiftMinutes(Number.parseInt(minutesValue), Number.parseInt(hoursValue));
        }
    }


    const options: Options = {
        buttons: [
            {
                name: "Toggle Timer", 
                title: "Toggle the timer on or off",
                onClick: () => list.info.useTimer = !list.info.useTimer
            },
            {
                name: "Clear",
                title: "Clear the timer",
                onClick: () => clear()
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
        <div class="state">
            {list.info.useTimer ? "On" : "Off"}
        </div>

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
            <div>{formatTime(list.timer.timeLeft)}</div>
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

    

    

    


    
</style>