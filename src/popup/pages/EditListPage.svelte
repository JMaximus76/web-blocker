<script lang="ts">
    import type { List } from "../../modules/listComponets";
    import { popupPageStore } from "../../modules/stores/popupStateStores";
    import { storageStore } from "../../modules/stores/storageStores";
    import TextButton from "../components/TextButton.svelte";
    import EditNameMode from "./blocks/EditNameMode.svelte";


    // should be safe because if its on this page then it must have passed a list to do it.
    $: list = $popupPageStore.list as List;


    function deleteList() {
        storageStore.deleteList(list.info.id);
        popupPageStore.main();
    }
</script>


{#if list !== null}
    <div class="edit">
        <EditNameMode info={list.info} />    
    </div>

    <div class="buttons">
        <TextButton isActive={!list.info.locked} onClick={deleteList}>
            Delete
        </TextButton>
    </div>
{/if}

<TextButton onClick={() => popupPageStore.main()}>
    Back
</TextButton>

<style>
    

    .edit {
        padding: 10px;
    }
</style>