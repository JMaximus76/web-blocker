<script lang="ts">
    import type { Color } from "../../modules/color";
    import { convert, darken } from "../../modules/color";


    export let name: string;
    export let fontSize: Number;
    export let color: Color;


    
</script>




<button on:click style="--fontSize:{fontSize + "px"}; --color:{convert(color)}; --colorDark:{convert(darken(color, 22))};">{name}</button>
    




<style>
    button {
        display: inline-block;

        box-sizing: content-box;
        padding: 8px;

        font-family: 'Rubik', sans-serif;
        font-weight: 500;
        text-align: center;
        font-size: var(--fontSize);

        background-color: var(--buttonBackground);


        border: none;
        border-top: solid var(--color) 3px;
        
        transition: all 0.1s;
        transition-timing-function: ease-out;
        
    }


    button:hover {
        background-color: var(--buttonHoverBackground);
        border-color: var(--colorDark);
    }

    button:active {
        background-color: var(--buttonActiveBackground);
        transition: all 0s;
    }

</style>