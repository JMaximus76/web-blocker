<script lang="ts">
    import { dropdown } from "../../../stores/popupStateStores";
</script>









<button on:click={dropdown.close} class="exit">
    Exit
</button>




<style>
    .exit {
        float: right;
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: var(--text);
        transition: color 0.3s;
        font-size: 14px;
        font-family: 'Roboto', sans-serif;
        margin-top: 1px;
        margin-right: 2px;
        font-style: italic;
        letter-spacing: 0.5px;
    }

    .exit:hover {
        color: var(--lightRed);
        
    }
   
</style>