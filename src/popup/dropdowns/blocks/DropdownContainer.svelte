<script lang="ts">
    import { fly } from "svelte/transition";
    import { dropdown } from "../../../stores/popupStateStores";



</script>









<button on:click={dropdown.close} class="close"></button>

<div transition:fly={{y: -400, duration: 300}} class="main">
    <slot></slot>
</div>



<style>
    
    .main {
        width: 290px;
        padding: 10px;

        box-sizing: border-box;

        position: absolute;
        top: 65px;
        left: calc((316px - 290px) / 2);


        background-color: var(--dropdown);
        
        border: 1px solid var(--border);
    }

    .close {
        margin: 0;
        padding: 0;
        border: none;
        background-color: transparent;
        height: 416px;
        width: 316px;
        position: absolute;
        top: 0px;
        left: 0px;  
    }


</style>