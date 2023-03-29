<script lang="ts">
    import type { Options } from "../popupTypes";

    // not sure how to avoid using any here, I'm bad at type script ;-;
    export let radioValue: any = null;
    export let textKey: string = "";
    export let options: Options = {};
    export let lineColor: string = "var(--neutral)";



</script>


<div class="body">

    <div class="content" style:box-shadow="0 2px {lineColor}">
        <slot></slot>
    </div>
        

    <div class="options">


        {#if options.text?.entrys[textKey] !== undefined}
            <div class="text">   
                <span 
                    title={options.text.entrys[textKey].title} 
                    style:color={(options.text.entrys[textKey].color ?? options.text.globalColor) ?? "var(--textColor)"}
                    class="option"
                >
                    {options.text.entrys[textKey].text}
                </span>  
            </div>
        {/if}



        {#if options.radio !== undefined}
            <div class="radio">
                {#each options.radio as radio (radio.name)}
                    <label title={radio.title}>
                        <input type=radio bind:group={radioValue} name="radio" value={radio.value}>
                        <span class="option">{radio.name}</span>
                    </label>
                {/each}
            </div>
        {/if}


        {#if options.buttons !== undefined}
            <div class="buttons">
                {#each options.buttons as button (button.name)}
                    <button class="option" title={button.title} on:click={button.onClick}>{button.name}</button>
                {/each}
            </div>
        {/if}


    </div>
</div>





<style>

    .body {
        width: 100%;
        font-size: 13px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin-top: 2px;
    }

    .content {
        font-size: 13px;
        transition: box-shadow 0.3s;
    }


    .option {
        display: inline-block;
        font-size: 12px;
        transition: color 0.3s;
        margin-right: 7px;
        margin-top: 5px;
        cursor: pointer;
        color: var(--textFade);
    }

    
    .radio span {
        cursor: pointer;
    }

    .radio input {
        display: none;
    }

    .radio input:checked + span {
        color: var(--text);
    }

    .buttons button {
        border: none;
        padding: 0;
        background-color: transparent;   
    }

    .buttons button:hover {
        color: var(--text);
    }


</style>
