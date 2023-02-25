<script lang="ts">
    import Button from "./components/Button.svelte";
    import { newColor } from "../modules/color";
    import { switchActiveMode } from "../modules/storage";
    import Lists from "./components/Lists.svelte";

</script>





<div id="main">
    
    <Button on:click={switchActiveMode} name={"Change Mode"} fontSize={23} color={newColor(71, 126, 255)} />

    <div id="lists">
        <Lists />
    </div>


</div>

    

    





<style>
    
  


    #main {
        background-color: transparent;
        height: 100%;
        width: 100%;
        display: inline-block;
    }

    #lists {
        box-sizing: border-box;
        height: 200px;
        width: 100%;
        margin: 10px 0px;
    }

    


</style>