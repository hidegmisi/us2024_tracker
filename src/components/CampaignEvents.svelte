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

        outline: 1px dashed red;
        outline-offset: -0.5px;
    }

    svg {
        width: 100%;
        height: auto;
        overflow: visible;
    }
</style>
