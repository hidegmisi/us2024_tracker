<script>
    import { onMount } from "svelte";
    import { drawChart, onResize } from "$lib/chartUtils";

    export let dailyData;
    export let aggregators;
    export let bgColor = "#fff";

    onMount(() => {
        drawChart(dailyData, aggregators, bgColor);
        window.addEventListener("resize", () => onResize(dailyData, aggregators, bgColor));
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
