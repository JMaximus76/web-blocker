<script lang="ts">
    import type { Options } from "../popupTypes";

    // not sure how to avoid using any here, I'm bad at type script ;-;
    export let radioValue: any = null;
    export let textKey: string = "";
    export let options: Options = {};
    export let lineColor: string = "var(--neutral)";
    export let enabled = true;

   

</script>


<div class="body">

    <div class="content" style:box-shadow="0 2px {enabled ? lineColor : "var(--darkNeutral)"}">
        <slot></slot>
    </div>
        

    <div class="options">

        {#if options.radio !== undefined && enabled}
            <div class="radio block">
                {#each options.radio as radio (radio.name)}
                    <label title={radio.title}>
                        <input type=radio bind:group={radioValue} name="radio" value={radio.value}>
                        <span class="option">{radio.name}</span>
                    </label>
                {/each}
            </div>
        {/if}


        {#if options.buttons !== undefined && enabled}
            <div class="buttons block">
                {#each options.buttons as button (button.name)}
                    <button class="option" title={button.title} on:click={button.onClick}>
                        {button.name}
                    </button>
                {/each}
            </div>
        {/if}

        {#if options.text?.entrys[textKey] !== undefined}
            <div class="text block">   
                <span title={options.text.entrys[textKey].title} 
                    style:color={options.text.entrys[textKey].color ?? options.text.globalColor ?? "var(--textColor)"}
                    class="option">
                    {options.text.entrys[textKey].text}
                </span>  
            </div>
        {/if}

        
    </div>
</div>





<style>

    .body {
        width: 100%;
        font-size: 14px;
        color: var(--text); 
        font-family: 'Roboto', sans-serif;
        margin-top: 2px;
    }

    .content {
        font-size: 14px;
        transition: box-shadow 0.3s;
    }

    .options {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: baseline;
        margin-top: 2px;
    }


    .block {
        margin-right: 7px;
    }

    .option {
        display: inline-block;
        font-size: 12px;
        font-family: inherit;
        transition: color 0.3s;
        margin: 0;
        margin-right: 12px;
        color: var(--textFade);
    }

    
    .radio input {
        display: none;
    }

    .radio span {
        cursor: pointer;
    }

    .radio input:checked + span {
        color: var(--text);
    }

    .buttons button {
        border: none;
        padding: 0;
        background-color: transparent;   
    }

    .buttons button {
        cursor: pointer;
    }

    .buttons button:hover {
        color: var(--text);
    }


</style>
