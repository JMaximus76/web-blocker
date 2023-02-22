<script lang="ts">
    import type  { Info, InfoDetails } from "../../modules/types";


    export let info: Info & InfoDetails;
</script>


<div>
    <span>{info.name}</span>
    <span>{info.mode}</span>
    <span>{info.active}</span>
    <span>{info.locked}</span>
</div>


<style>
    div {
        display: flex;
        flex-direction: row;
    }
</style>