<script lan='ts'>

</script>





<header>
    <h1>Web Block</h1>
    <button><div id="in"><div id="svg"></div></div></button>
</header>



<style>

    header {
        height: 50px;

        padding: 5px 15px;
        margin-bottom: 10px;

        border: none;
        border-radius: var(--radius);

        box-shadow: -7px -7px 10px var(--light), 7px 7px 10px var(--dark);

        background-color: var(--panel);

        display: flex;
        flex-direction: row;
        align-items: center;


        box-sizing: border-box;

    }


    h1 {
        font-size: 40px;
        font-weight: 400;


        font-family: 'Tilt Neon', cursive;

        margin: 0;
    }


    #svg {
        width: 20px;
        height: 20px;
        background-image: url("../../svg/gear.svg");
        background-size: contain;
        background-repeat: no-repeat;
    }


    button {
        margin-left: auto;

        box-shadow: 0 0 0 var(--light), 0 0 0 var(--dark);
        transition: box-shadow 0.05s ease-in;
        
        padding: 0;
        
        cursor: pointer;
        border: none;
        border-radius: 100px;

        background-color: transparent;
    }

    button:hover {
        box-shadow: -7px -7px 10px var(--light), 7px 7px 10px var(--dark);
    }

    button:active {
        transition: box-shadow 0s;
        box-shadow: 0 0 0 var(--light), 0 0 0 var(--dark);
    }


    #in {

        padding: 5px;
        border: none;
        border-radius: 100px;
        transition: box-shadow 0.05s ease-out, color 0.3s;
        box-shadow: inset 0 0 0 var(--light), inset 0 0 0 var(--dark);
    }


    #in:hover {
        color: #c0c0c0;
    }

    #in:active {
        transition: box-shadow 0s;
        color: #c0c0c0;
        box-shadow: inset -7px -7px 15px var(--light), inset 7px 7px 15px var(--dark);
    }
</style>