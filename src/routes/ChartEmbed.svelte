<script>
    import { onMount } from "svelte";
    import Chart from "../components/Chart.svelte";
    import { getPollData, prepareData, aggregators } from "../lib/dataUtils.js";

    export let repo;

    let dailyAggData = [];
    let dailyData = [];

    async function fetchData() {
        try {
            const data = await getPollData(repo);
            ({ dailyAggData, dailyData } = prepareData(data));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    onMount(fetchData);
</script>
  
<article>
    <div class="chartContainer">
        {#if dailyAggData.length !== 0 && dailyData.length !== 0 && aggregators.length !== 0}
            <Chart class="chart" {dailyAggData} {dailyData} {aggregators} />
        {/if}
    </div>
</article>

<style lang="scss">
article {
    display: flex;
    justify-content: center;

    .chartContainer {
        width: 100%;
        max-width: 700px;
        margin: 1rem;
    }
}
</style>
