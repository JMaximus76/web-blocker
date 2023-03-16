<script lang="ts">

    
    
    export let color: string = "var(--buttonColor)";
    export let hover: string = "var(--buttonHover)";
    export let active: string = "var(--buttonActive)";

    export let text: string | undefined = undefined;
    export let fontSize: string = "16px";
    export let textColor: string = "var(--text)"
    export let verticalPadding: string = "10px";
    export let horizontalPadding: string = "15px";



    
</script>



<div id="backgroundColor" style="--color:{color};">
    <button on:click style="--hover:{hover}; --active:{active}; --verticalPadding:{verticalPadding}; --horizontalPadding:{horizontalPadding};">

    <div id="text" style="--fontSize:{fontSize}; --textColor:{textColor};">{text}</div>

    </button>
</div>




<style>

    #backgroundColor {
        background-color: var(--color);
        border-radius: var(--radius);
        display: inline-block;
    }


    #text {
        color: var(--textColor);
        font-family: 'Roboto', sans-serif;
        font-size: var(--fontSize);
    }
    


    button {
        cursor: pointer;

        background-color: transparent;
        padding: var(--verticalPadding) var(--horizontalPadding);
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