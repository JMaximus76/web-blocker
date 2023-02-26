<script lang="ts">
    import Header from "./components/Header.svelte";
    import Lists from "./components/Lists.svelte";



</script>





<div id="main">
    <Header />
    <div id="lists">
        <Lists />
    </div>
</div>

    

<style>

    #main {
        background-color: transparent;
        height: 100%;
        width: 100%;
        display: inline-block;
    }

    #lists {
        box-sizing: border-box;
        height: 200px;
        width: 100%;
        margin: 10px 0px;
    }

    


</style>