<script lang="ts">
    import CandidateStanding from "../components/CandidateStanding.svelte";
    import { onMount } from "svelte";
    import type { PollData } from "../lib/types";
    import { fetchPollData, pollData } from "../stores/dataStore";
    import Chart from "../components/Chart.svelte";
    import { aggregators } from "../lib/dataUtils";
    import AggregatorStrip from "../components/AggregatorStrip.svelte";
    import Gauge from "../components/Gauge.svelte";
    import { dynamicDayData, calculateDemLead } from "../stores/dataStore";
    import type { Segment } from "../lib/types";

    export let repo: string;

    let data: PollData = {
        demLead: null,
        dailyData: [],
    };

    onMount(async () => {
        await fetchPollData(repo);
    });

    $: data = $pollData;
    
    let demLead: number = 0;

    $: demLead = $dynamicDayData ? calculateDemLead($dynamicDayData) : 0;

    let leaderText = "";
    let leaderColor = "";

    const segments: Segment[] = [
        { start: -7, end: -6, color: "#0000ff69", leadingParty: "dem", probability: 0.999 },
        { start: -6, end: -5, color: "#0000ff32", leadingParty: "dem", probability: 0.998 },
        { start: -5, end: -4, color: "#0000ff32", leadingParty: "dem", probability: 0.958 },
        { start: -4, end: -3, color: "#0000ff32", leadingParty: "dem", probability: 0.845 },
        { start: -3, end: -2, color: "#0000ff32", leadingParty: "dem", probability: 0.5 },
        { start: -2, end: -1, color: "#0000ff32", leadingParty: "rep", probability: 0.731 },
        { start: -1, end: 0, color: "#ff000035", leadingParty: "rep", probability: 0.921 },
        { start: 0, end: 1, color: "#ff000035", leadingParty: "rep", probability: 0.981 },
        { start: 1, end: 2, color: "#ff000035", leadingParty: "rep", probability: 0.996 },
        { start: 2, end: 7, color: "#ff000035", leadingParty: "rep", probability: 1 },
    ]

    $: setDemLeadAndWinningHTML(demLead);

    // Logic to determine the leader based on demLead
    function setDemLeadAndWinningHTML(demLead: number) {        
        const band = segments.find((segment) => -demLead * 100 >= segment.start && -demLead * 100 < segment.end);
        if (band) {
            leaderText = (band.leadingParty === "dem" ? "Harris" : "Trump") + (band.probability > 0.9 ? " győz" : " esélyesebb");
            leaderColor = band.leadingParty === "dem" ? "#0000ff" : "#ff0000";
        }

        if (band?.probability < 0.7) {
            leaderText = "Hasonló esélyek";
        }
    }

    setDemLeadAndWinningHTML(demLead);
</script>
  
<article>
    {#if data.demLead !== null}
    <div class="chartContainer">
        <Gauge
            value={-demLead * 100}
            minValue={-7}
            maxValue={7}
            segments={segments}
            strokeWidth={70}
            tickInterval={1}
            majorTicks={[-4, -2, 0, 2, 4]}
        />
        <div class="chartInfos">
            <img src="images/harris.png" alt="Harris" class="dem" />
            <div class="textContainer">
                <h2 id="leaderText">Prognózis:</h2>
                <div class="standing">
                    {leaderText}
                </div>
            </div>
            <img src="images/trump.png" alt="Trump" class="rep" />
        </div>
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

    :global(#candidateStanding main) {
        background-color: #eee;
    }

    .chartContainer {
        width: 100%;
        margin: 1rem;

        .chartInfos {
            max-width: 250px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: -8px;
            padding: 0 24px;

            img {
                width: 36px;
                height: 36px;
                border-radius: 50%;

                &.dem {
                    background-color: #0000ff69;
                }
                &.rep {
                    background-color: #ff000073;
                }
            }

            .textContainer {
                align-items: center;
                padding: 0 8px;
                
                h2#leaderText {
                    font-size: 0.9rem;
                    font-weight: 600;
                    padding: 2px 3px;
                    padding-bottom: 0;
                    text-align: center;
                }
                .standing {
                    font-size: 0.75rem;
                    text-align: center;

                    span {
                        background: none;
                        padding: 0;
                    }
                }
            }
        }
    }

    .hidden {
        display: none;
    }
}
</style>
