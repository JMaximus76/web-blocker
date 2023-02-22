
<script lang="ts">
    import type { InfoList } from "../../modules/types";
    //import { togleActiveMode } from "../../modules/storage";
    //import ReverseIcon from "../../svg/reverse.svg";

    export let infoList: InfoList;
</script>





<!-- {infoList.activeMode.charAt(0).toUpperCase() + infoList.activeMode.slice(1)} -->


<label id="toggle" for="switch">
    <input type="checkbox" id="switch" name="Mode" />
    <div id="slider">Block Mode</div>
</label>



<style>
    :root {
        --width: 200px;
        --height: 40px;
    } 

    #toggle {
        width: var(--width);
        height: var(--height);
        border-radius: 7px;
        background-color: #ccc;
        position: relative;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    #toggle:hover {
        background-color: #ddd;
    }

    #toggle input {
        display: none;
    }

    #slider {
        content: "Block Mode";
        position: absolute;

        top: 2px;
        left: 2px;
        width: calc((var(--width) / 2) - 4px);
        height: calc(var(--height) - 4px);

        border-radius: 5px;
        background-color: #fff;
        transition: left 0.2s;
    }

    #toggle input:checked + #slider {
        content: "Allow Mode";
        left: calc(var(--width) / 2);
    }

  



    
</style>