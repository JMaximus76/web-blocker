<script lang="ts">
    import { onMount } from "svelte";
    import type Info from "../../modules/info";
    import List from "../../modules/list";
    import { addEntryPopupStore, currentUrlStore, timerDisplayStore } from "../../modules/store";
  




    export let info: Info;



    $: matchTitle = `Match Found: This list matched with ${List.clipURL("domain", $currentUrlStore)}`;
    $: activeTitle = `${info.name} is ${info.active? "enabled" : "disabled"}`;

    const lockedTitle = "Locked List: This list has been locked, you will not be able to edit it in the popup";
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
            });
        } 
    });

    

</script>




<div id="main">
    <button on:click={toggleActive} id="infoButton">

        <div title={activeTitle}>
            <svg id="active" width="20" height="20" >
                <rect class={ info.active? "enabled" : "disabled" } width="20" height="20" rx="3" ry="3" />
            </svg>
        </div>

        {info.name}
    
        <div id="spacer"></div>


        {#if info.useTimer}
            <div id="timer">
                {$timerDisplayStore.get(info.timerId)}
            </div>
        {/if}


        <div id="indicators">
            {#await info.pullList() then list}
                <div class:invisible={!list.check($currentUrlStore)} id="match" title={matchTitle}>M</div>
            {/await}
            <div class:invisible={!info.locked} id="lock" title={lockedTitle}>L</div>
        </div>



    </button>


    <button title={addTitle} on:click={() => addEntryPopupStore.open(info.id)} id="addButton">
        <svg id="add" height="20" width="20">
            <rect x="8" y="0" height="20" width="4"/>
            <rect x="0" y="8" height="4" width="20"/>
        </svg>
    </button>


    <button title={editTitle} id="listButton">
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
        
        font-size: 0.8em;
    }





    .invisible {
        display: none;
    }

    #indicators {
        margin-left: 4px;
        display: flex;
        flex-direction: row-reverse;
        cursor: help;
        width: 45px;
    }

    #match, #lock {
        font-family: 'Tilt Neon', cursive;
        font-size: 13px;
        color: var(--text);
        margin: 0 5px;
        padding: 1px;
    }


    


    #spacer {
        margin-left: auto;
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


    #addButton {
        border: none;
        margin: none;
        padding: none;
    }

    #add {
        display: flex;
        flex-direction: row;

        fill: var(--icon);
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