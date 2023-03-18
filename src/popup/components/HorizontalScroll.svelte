<script lang="ts">
    import { tweened } from "svelte/motion";





    let container: HTMLDivElement;
    const scroll = tweened(0, { duration: 70 });

    $: {
        if (container !== undefined) container.scrollLeft = $scroll;
    }

    function invertScroll(event: WheelEvent) {
        if (!event.deltaY) return;

        function scrollAmount(): number {
            const scrollAmount = container.scrollLeft + event.deltaY;

            if (scrollAmount >= container.scrollWidth) {
                return container.scrollWidth;
            } else if (scrollAmount <= 0) {
                return 0;
            } else {
                return scrollAmount;
            }
        }

        scroll.set(scrollAmount());
    }

</script>



<div class="scroll" on:wheel={invertScroll} bind:this={container}>
    <slot></slot>
</div>


<style>

    .scroll {
        overflow-y: scroll;
        scrollbar-width: none;
    }

    .scroll::-webkit-scrollbar {
        display: none;
    }

</style>