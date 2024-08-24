<script>
    import { onMount } from "svelte";
    import { drawChart, onResize } from "$lib/chartUtils";

    export let dailyData;
    export let aggregators;

    onMount(() => {
        drawChart(dailyData, aggregators);
        window.addEventListener("resize", () => onResize(dailyData, aggregators));
    });

</script>

<svg class="polls"></svg>

<style>
    .polls {
        margin: 1rem 0;
    }

    svg {
        width: 100%;
        height: auto;
        overflow: visible;
    }
</style>
