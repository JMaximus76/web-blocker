<script lang='ts'>
    
    import ImgButton from "./ImgButton.svelte";

</script>





<header>
    <div id="logo"></div>
    <h1>WebBlock _</h1>
    <div id="button">
        <ImgButton svgURL={"url(/hamburger.svg)"} color={"transparent"} hover={"rgba(0,0,0,30%)"} active={"rgba(0,0,0,50%)"}/>
    </div>
</header>



<style>

    #button {
        margin-left: auto;
    }

    #logo {
        width: 27px;
        height: 27px;
        margin-right: 5px;
        background-image: url("../../svg/logo.svg");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    header {
        height: 50px;
        
        margin: 3px 3px 12px 7px;




        background-color: var(--background);

        display: flex;
        flex-direction: row;
        align-items: center;


        box-sizing: border-box;

    }


    h1 {
        font-size: 27px;


        font-family: 'Roboto', sans-serif;
        color: var(--text);
        margin: 0;
    }

   
</style>