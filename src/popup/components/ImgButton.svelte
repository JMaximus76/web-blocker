<script lang="ts">

    
    
    export let color: string = "var(--buttonColor)";
    export let hover: string = "var(--buttonHover)";
    export let active: string = "var(--buttonActive)";


    export let svgURL: string;
    export let svgHeight: string = "30px";
    export let svgWidth: string = "30px";



    
</script>



<div id="backgroundColor" style="--color:{color};">
    <button on:click style="--hover:{hover}; --active:{active};">
        <div id="svg" style="--height:{svgHeight}; --width:{svgWidth}; --svgURL:{svgURL}"></div>
    </button>
</div>




<style>

    #backgroundColor {
        background-color: var(--color);
        border-radius: var(--radius);
        display: inline-block;
    }



    #svg {
        width: var(--width);
        height: var(--height);
        background-image: var(--svgURL);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }



    button {
        cursor: pointer;
        
        background-color: transparent;
        padding: 10px;
        border: none;
        border-radius: var(--radius);
        transition: background-color var(--transitionSpeed);
    }

    button:hover {
        background-color: var(--hover);
    }

    button:active {
        background-color: var(--active);
    }



</style>