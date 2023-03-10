<script lang="ts">
    import type Info from "../../modules/info";
    import { currentUrlStore } from "../../modules/store";
    import { onDestroy } from 'svelte';




    export let info: Info;



    $: matchText = `Match Found: This list matched with ${$currentUrlStore}`;
    $: activeTitle = `${info.name} is ${info.active? "enabled" : "disabled"}`;

    const lockedText = "Locked List: This list has been locked, you will not be able to enable/disable it in the popup.";


    function toggleActive(): void {
        if (info.locked) return;
        info.toggleActive();
    }

    if (info.useTimer) {

        info.pullTimer()
        .then((timer) => {

            timeLeft = timer.timeLeft;

            timer.startListening();

            if (!timer.isDone() && timer.startTime !== null) {
                const interval = startTimer();
                onDestroy(() => {
                    clearInterval(interval);
                });
            } 
            // do some store shit i don't want to deal with this
            // if that dont' work use beforeUpdate

        });
    } 


    

    function startTimer(): NodeJS.Timer {

        const decreaseTimer = () => {
            timeLeft -= 1000;
            if (timeLeft <= 0) {
                clearInterval(interval);
            }
        }

        const interval = setInterval(decreaseTimer, 1000);
        return interval;
    }

    let timeLeft = 0;

    function formatTime(time: number): string {
        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        
        const h = Math.trunc(time/hour);
        const m = Math.trunc((time - h*hour)/minute);
        const s = Math.trunc((time - h*hour - m*minute)/second);

        return `${(h < 10? "0" : "") + h}:${(m < 10? "0" : "") + m}:${(s < 10? "0" : "") + s}`
    }

    $: displayTime = formatTime(timeLeft);

    


</script>




<div id="main">
    <button on:click={toggleActive} id="infoButton">

        <div title={activeTitle}>
            <svg id="active" width="20" height="20" >
                <rect class={ info.active? "enabled" : "disabled" } width="20" height="20" rx="3" ry="3" />
            </svg>
        </div>

        {info.name}
    

        {#if info.useTimer}
            <div id="timer">
                {displayTime}
            </div>
        {/if}


        <div id="indicators">
            {#await info.pullList() then list}
                <div class:invisible={!list.check($currentUrlStore)} id="match" title={matchText}>M</div>
            {/await}
            <div class:invisible={!info.locked} id="lock" title={lockedText}>L</div>
        </div>



    </button>



    <button id="listButton">
        <svg id="arrow" height="20" width="20">
            <defs>
                <mask id="arrow-mask">
                    <rect x="0" y="0" height="20" width="20" style="fill: white;" />
                    <polygon points="0,4 0,16 8,10" style="fill: black;" />
                </mask>
            </defs>
            <polygon points="0,0 0,20 14,10" mask="url(#arrow-mask)" style="fill: var(--icon);" />
        </svg>
    </button>
</div>



<style>
 
    




    #main {
        display: flex;
        flex-direction: row;
        box-sizing: content-box;
        width: 100%;
        height: 30px;

        margin-bottom: 7px;

        border-radius: var(--radius);
        background-color: var(--element);
    }



    #infoButton {
        display: flex;
        flex-direction: row;
        align-items: center;

        padding: 0;
        border: none;
        border-top-left-radius: var(--radius);
        border-top-right-radius: var(--raidus);

        width: calc(100% - 30px);
        height: 100%;

        cursor: pointer;
        
        font-family: 'Roboto', sans-serif;
        font-size: 19px;
        color: var(--text);
        text-align: left;
    }

  

    
    #active {
        display: flex;
        flex-direction: row;
        margin: 0px 5px;
    }

    .enabled {
        fill: transparent;
    }

    .disabled {
        fill: var(--panel);
    }



    #timer {
        margin-left: 10px;
    }





    .invisible {
        display: none;
    }

    #indicators {
        margin-left: auto;
        display: flex;
        flex-direction: row-reverse;
        cursor: help;
    }

    #match, #lock {
        font-family: 'Tilt Neon', cursive;
        font-size: 13px;
        color: var(--text);
        margin: 0 5px;
        padding: 1px;
    }


    




    


    #listButton {
        height: 100%;
        width: 30px;

        padding: 0;

        border: none;
        border-radius: 0;
    }


    #arrow {
        display: flex;
        flex-direction: row;
        margin-left: 8px;

    }

    


    button {
        background-color: var(--buttonBackground);
        transition: background-color var(--transitionSpeed);
        
    }

    button:hover {
        background-color: var(--buttonHover);
    }

    button:active {
        background-color: var(--buttonActive);
    }

    

</style>