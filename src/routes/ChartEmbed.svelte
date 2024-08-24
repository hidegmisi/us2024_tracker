<script>
    import { onMount } from "svelte";
    import Chart from "../components/Chart.svelte";
    import { getPollData, prepareData, aggregators } from "../lib/dataUtils.js";

    export let repo;

    let dailyData = [];

    async function fetchData() {
        try {
            const data = await getPollData(repo);
            dailyData = prepareData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    onMount(fetchData);
</script>
  
<article>
    <div class="chartContainer">
        {#if dailyData.length !== 0 && aggregators.length !== 0}
            <Chart class="chart" {dailyData} {aggregators} />
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
