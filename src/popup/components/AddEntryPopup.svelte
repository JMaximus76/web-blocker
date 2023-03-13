
<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { AddEntryPopupStore } from "../../modules/store";
    import InputUrl from "./InputURL.svelte";


</script>






{#if $AddEntryPopupStore.active}
    <button on:click={AddEntryPopupStore.close} transition:fade={{duration: 300}} id="blur">
        <div transition:fly={{y: -200, duration: 300, delay: 100}} id="main">
            <lable>Enter a URL to be blocked</lable>
            <InputUrl />
        </div>
    </button>
{/if}


<style>

    #main {
        height: 100px;
        width: 150px;
        position: absolute;
        top: 100px;
        left: 75px;
        background-color: blue;
    }

    #blur {
        margin: 0;
        padding: 0;
        border: none;
        background-color: transparent;

        height: 500px;
        width: 400px;
        position: absolute;
        top: 0px;
        left: 0px;
        backdrop-filter: blur(6px);
    }

</style>