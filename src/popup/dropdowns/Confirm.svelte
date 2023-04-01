<script lang="ts">
    import { dropdown } from "../../stores/popupStateStores";
    import TextButton from "../components/TextButton.svelte";
    import DropdownContainer from "./blocks/DropdownContainer.svelte";

    const { callback, text } = $dropdown.confirm!;


    function yes() {
        callback();
        dropdown.close();
    }

    function no() {
        dropdown.close();
    }

</script>



<DropdownContainer>
    <div class="confirm">
        <h1>{text}</h1>
        <p>Are you sure? This action is permanent.</p>
        <div class="buttons">
            <div>
                <TextButton onClick={yes}>Yes</TextButton>
            </div>
            <div>
                <TextButton onClick={no}>No</TextButton>
            </div>
        </div>
    </div>
</DropdownContainer>



<style>
    .confirm {
        color: var(--text);
        text-align: center;

    }

    .confirm h1 {
        margin: 0;
        margin-bottom: 10px;
        font-size: 21px;
        font-family: 'Roboto', sans-serif;
    }

    .confirm p {
        margin: 0;
        margin-bottom: 10px;
        font-size: 14px;
        font-family: 'Roboto', sans-serif;
    }

    .buttons {
        display: flex;
        justify-content: center;
    }

    .buttons div {
        margin: 0 10px;
    }
</style>