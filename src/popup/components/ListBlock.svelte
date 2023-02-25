<script lang="ts">
    import type { Info } from "../../modules/types";



    export let info: Info;


</script>




<div class={(info.active)? "enabled" : "disabled"} id="block">
    <button id="infoButton">
        {info.name}
        <div id="container">
            <div title="Match Found: This has an entry that matches the current website" id="match">M</div>
            <div title="Locked List: This list has been locked, you will not be able to enable/disable in this popup." id="lock">L</div>
        </div>
    </button>
    <button id="listButton"></button>
</div>



<style>
 
    .enabled {
        border-top: solid 3px #54a865;
    }
    .disabled {
        border-top: solid 3px #af3d28;
    }



    #block {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 35px;
        

        
    }





    #infoButton {
        

        display: flex;
        flex-direction: row;
        align-items: center;

        padding: 0 10px;
        border: none;
        border-radius: 0;

        width: calc(100% - 30px);
        height: 100%;

        
        font-family: 'Open Sans', sans-serif;
        font-size: 19px;
        font-weight: 500;
        text-align: left;
    }

    


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

    #container {
        margin-left: auto;
        display: flex;
        flex-direction: row-reverse;
    }

    #match, #lock {
        
        font-family: 'Comfortaa', cursive;
        font-size: 13px;


        margin: 0 5px;
        padding: 1px;
    }


    #match {
        color: #276ba3;
    }

    #lock {
        color: #6e5308;
    }

</style>