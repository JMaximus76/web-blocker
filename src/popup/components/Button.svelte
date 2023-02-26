<script lang="ts">

    export let name: string;
    export let fontSize: Number;



    
</script>




<button on:click style="--fontSize:{fontSize + "px"};"><div id=inner>{name}</div></button>
    




<style>
    


    button {
        box-shadow: 0 0 0 var(--light), 0 0 0 var(--dark);
        transition: box-shadow 0.05s ease-in;

        cursor: pointer;

        padding: 0;

        border: none;
        border-radius: var(--radius);

        background-color: var(--element);
    }

    button:hover {
        box-shadow: -7px -7px 10px var(--light), 7px 7px 10px var(--dark);
    }

    button:active {
        transition: box-shadow 0s;
        box-shadow: 0 0 0 var(--light), 0 0 0 var(--dark);
    }


    #inner {
        color: var(--textLight);
        font-family: 'Open Sans', sans-serif;
        font-size: var(--fontSize);
        font-weight: 600;

        padding: 13px;

        border: none;
        border-radius: 10px;


        transition: box-shadow 0.05s ease-out, color 0.3s;
        box-shadow: inset 0 0 0 var(--light), inset 0 0 0 var(--dark);
    }


    #inner:hover {
        color: var(--text);
    }

    #inner:active {
        transition: box-shadow 0s;
        color: var(--textDark);
        box-shadow: inset -7px -7px 15px var(--light), inset 7px 7px 15px var(--dark);
    }

</style>