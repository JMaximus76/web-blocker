<script lang="ts">
    import type { Options } from "../../modules/types";

    // not sure how to avoid using any here, I'm bad at type script ;-;
    export let radioValue: any = null;
    export let options: Options = {};
    export let lineColor: string = "var(--neutral)";

</script>

<script context="module">
    
</script>



<div class="body">

    <div class="content" style="--lineColor:{lineColor}">
        <slot></slot>
    </div>
        

    <div class="options">


        {#if options.radio !== undefined}
            <div class="radio">
                {#each Object.keys(options.radio) as key (key)}
                    <label title={options.radio[key].title}>
                        <input type=radio bind:group={radioValue} name="radio" value={options.radio[key].value}>
                        <span class="option">{key}</span>
                    </label>
                {/each}
            </div>
        {/if}


        {#if options.buttons !== undefined}
            <div class="buttons">
                {#each Object.keys(options.buttons) as key (key)}
                    <button class="option" title={options.buttons[key].title} on:click={options.buttons[key].onClick}>{key}</button>
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
        box-shadow: 0 2px var(--lineColor);
        transition: box-shadow 0.3s;
    }


    .option {
        font-size: 10px;
        transition: color 0.2s;
        margin-right: 7px;
        cursor: pointer;
        color: var(--textFade);
    }

    
    .radio span {
        cursor: pointer;
        transition: color 0.2s;
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
