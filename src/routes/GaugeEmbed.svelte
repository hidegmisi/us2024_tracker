<script lang="ts">
    import CandidateStanding from "../components/CandidateStanding.svelte";
    import { onMount } from "svelte";
    import type { PollData } from "../lib/types";
    import { fetchPollData, pollData } from "../stores/dataStore";
    import Chart from "../components/Chart.svelte";
    import { aggregators } from "../lib/dataUtils";
    import AggregatorStrip from "../components/AggregatorStrip.svelte";

    export let repo: string;

    let data: PollData = {
        demLead: null,
        dailyData: [],
    };

    onMount(async () => {
        await fetchPollData(repo);
    });

    $: data = $pollData;
</script>
  
<article>
    {#if data.demLead !== null}
    <div class="chartContainer">
        <CandidateStanding />
    </div>
    {/if}
    <div class="hidden">
        {#if data.dailyData.length !== 0}
            <AggregatorStrip dailyData={data.dailyData} />
            <Chart dailyData={data.dailyData} {aggregators} />
        {/if}
    </div>
</article>

<style lang="scss">
article {
    display: flex;
    justify-content: center;

    padding: 6px;
    border-top: 1px solid blue;
    border-left: 1px solid blue;
    border-right: 1px solid red;
    border-bottom: 1px solid red;

    :global(#candidateStanding main) {
        background-color: #eee;
    }

    .chartContainer {
        width: 100%;
        margin: 1rem;
    }

    .hidden {
        display: none;
    }
}
</style>
