<script lang="ts">
    export let isActive: boolean = true;
    export let onClick: () => void;


    function handleClick() {
        if (isActive) onClick();
    }
</script>



<div class="backgroundColor">
    <button on:click={handleClick} class={isActive ? "active" : "inactive"}>
        <div class="content">
            <slot></slot>
        </div>
    </button>
</div>




<style>

    .backgroundColor {
        background-color: var(--buttonColor);
        display: inline-block;
        border-radius: var(--radius);
    }


    .content {
        color: var(--text);
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        transition: color 0.3s;
    }

    button.inactive .content {
        color: var(--textFade);
    }

    

    button {
        cursor: default;
        background-color: transparent;
        padding: 4px 12px;
        border: none;
        border-radius: var(--radius);
        transition: background-color 0.3s;
    }

    

    .active {
        cursor: pointer;
    }

    .active:hover {
        background-color: var(--buttonHover);
    }

    .active:active {
        transition: background-color 0s;
        background-color: var(--buttonActive);
    }

    

</style>