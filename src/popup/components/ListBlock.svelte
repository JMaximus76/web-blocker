<script lang="ts">
    import type Info from "../../modules/info";
    import { currentUrlStore } from "../../modules/store";



    export let info: Info;


    let matchText: string;
    $: matchText = `Match Found: This list matched with ${$currentUrlStore}`;

    const lockedText = "Locked List: This list has been locked, you will not be able to enable/disable it in the popup.";


    function toggleActive(): void {
        if (info.locked) return;
        info.toggleActive();
    }


</script>




<div id="block">

    <button on:click={toggleActive} id="infoButton">
        <div id="active" class={((info.active)? "enabled" : "disabled")}></div>
        {info.name}
        
        <div id="container">
            {#await info.pullList() then list}
                <div class:invisible={!list.check($currentUrlStore)} id="match" title={matchText}>M</div>
            {/await}
            <div class:invisible={!info.locked} id="lock" title={lockedText}>L</div>
        </div>
    </button>

    <button id="listButton"><div id="arrow"></div></button>
</div>



<style>
 
    




    #block {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 35px;

        border-radius: var(--radius);
        background-color: var(--element);
    }





    #infoButton {
        display: flex;
        flex-direction: row;
        align-items: center;

        padding: 0 10px;
        border: none;
        border-radius: var(--radius) 0 0 var(--radius);

        width: calc(100% - 30px);
        height: 100%;

        cursor: pointer;
        
        font-family: 'Tilt Neon', cursive;
        font-size: 19px;
        font-weight: 500;
        text-align: left;
    }

    #infoButton:active {
        background-color: var(--elementDark);
    }

    #arrow {
        background-image: url("../../svg/arrow.svg");
        background-repeat: no-repeat;
        background-size: contain;
        height: 18px;
        width: 18px; 
    }


    #active {
        background-repeat: no-repeat;
        background-size: contain;
        height: 18px;
        width: 18px;
        margin: 0 4px;
    }

    .enabled {
        background-image: url("../../svg/circle.svg");
    }

    .disabled {
        background-image: url("../../svg/line.svg");
    }

    .invisible {
        display: none;
    }

    #container {
        margin-left: auto;
        display: flex;
        flex-direction: row-reverse;
        cursor: help;
    }


    #match, #lock {
        font-family: 'Comfortaa', cursive;
        font-size: 13px;

        margin: 0 5px;
        padding: 1px;
    }
    #match { color: #276ba3; }
    #lock { color: #6e5308; }

    


    #listButton {

        height: 100%;
        width: 30px;

        padding: 0;

        border: none;
        border-radius: 0;
    }


    button {
        background-color: var(--buttonBackground);
        transition: all 0.1s;
        transition-timing-function: ease-out;
    }

    button:hover {
        background-color: var(--buttonHoverBackground);
    }

    button:active {
        background-color: var(--buttonActiveBackground);
        transition: all 0s;
    }

    

</style>