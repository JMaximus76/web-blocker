<script lang="ts">

    export let isActive: boolean = true;
    
    export let color: string = "var(--buttonColor)";
    export let hover: string = "var(--buttonHover)";
    export let active: string = "var(--buttonActive)";

    export let text: string | undefined = undefined;
    export let fontSize: string = "16px";
    export let textColor: string = "var(--text)";
    export let textFadeColor: string = "var(--textFade)";
    export let verticalPadding: string = "10px";
    export let horizontalPadding: string = "15px";



    
</script>



<div id="backgroundColor" style="--color:{color};">
    <button
        on:click
        style="
            --hover:{hover};
            --active:{active};
            --verticalPadding:{verticalPadding};
            --horizontalPadding:{horizontalPadding};
        "
        class:isActive
        class:inactive={!isActive}
    >

    <div id="text" style="--fontSize:{fontSize}; --textColor:{textColor}; --textFadeColor:{textFadeColor}">{text}</div>

    </button>
</div>




<style>

    #backgroundColor {
        background-color: var(--color);
        border-radius: var(--radius);
        display: inline-block;
    }


    #text {
        color: var(--textFadeColor);
        font-family: 'Roboto', sans-serif;
        font-size: var(--fontSize);
    }

    button.isActive > #text {
        color: var(--textColor);
    }
    


    button {
        cursor: not-allowed;

        background-color: transparent;
        padding: var(--verticalPadding) var(--horizontalPadding);
        border: none;
        border-radius: var(--radius);
        transition: background-color var(--transitionSpeed);
    }

    

    .isActive {
        cursor: pointer;
    }

    .isActive:hover {
        background-color: var(--hover);
    }

    .isActive:active {
        background-color: var(--active);
    }



</style>