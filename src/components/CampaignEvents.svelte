<script>
    import { drawEventsChart } from "../lib/chartingUtils/campaignEventsUtils";
    import { onMount } from "svelte";

    export let dailyData;

    onMount(() => {
        console.log('pisa');
        
        drawEventsChart(dailyData);
    });

</script>

<svg class="campaignEvents"></svg>

<style>
    .campaignEvents {
        width: 100%;
        margin: 1rem 0;
        padding: 2px;

        border: 1px dashed red;
    }

    svg {
        width: 100%;
        height: auto;
        overflow: visible;
    }
</style>
