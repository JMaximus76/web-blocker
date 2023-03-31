<script lang="ts">
    import type { Info } from "../../../modules/listComponets";
    import { capitalizeFirstLetter } from "../../../modules/util";

    
    import OptionsBlock from "../../components/OptionsBlock.svelte";
    import type { Options } from "../../popupTypes";

    export let info: Info;

    const options: Options = {
        buttons: [
            {   
                name: "Toggle",
                title: "Changes the mode of the list",
                onClick: () => {
                    info.mode = (info.mode === "block")? "allow" : "block";
                }
            }
        ],
    };
</script>




<div>
    <h2>Mode</h2>
    <OptionsBlock options={options}>
        {capitalizeFirstLetter(info.mode)}
    </OptionsBlock>
</div>



<style>
    div {
        width: auto;
        margin-top: 2px;
        margin-left: 10px;
    }

    h2 {
        font-size: 13px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin: 3px 0 0 0;
        font-weight: normal;
    }
</style>