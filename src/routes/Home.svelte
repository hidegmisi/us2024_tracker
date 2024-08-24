<script lang="ts">
    import * as d3 from "d3";
    import CandidateStanding from "../components/CandidateStanding.svelte";
    import Chart from "../components/Chart.svelte";
    import { getPollData, prepareData, aggregators } from "../lib/dataUtils.js";

    export let repo: string;

    let dailyAggData = [];
    let dailyData = [];

    let aggregatorsCurrent = [];

    let demLead: number | null = null;

    function setAggregatorsCurrent(data) {
        const lastDay = data[data.length - 1];
        const currentTrump = lastDay.Trump;
        const currentHarris = lastDay.Harris;
        const aggregatorNameMap = {
            fivethirtyeight: "538",
            realclearpolling: "RCP",
            natesilver: "Silver Bulletin",
            nyt: "NYT",
        };
        aggregatorsCurrent = Object.keys(aggregatorNameMap).map(
            (aggregator) => {
                const trump = currentTrump[aggregator];
                const harris = currentHarris[aggregator];
                const lead = (harris - trump) * 100;
                return {
                    name: aggregator,
                    displayName: aggregatorNameMap[aggregator],
                    lead: Math.abs(lead.toFixed(1)),
                    leading: lead > 0 ? "dem" : "rep",
                };
            },
        );
    }

    function getDemLead() {
        const lastDay = dailyAggData[dailyAggData.length - 1];
        const demLead = lastDay.Harris - lastDay.Trump;
        return demLead;
    }

    async function fetchData() {
        try {
            const data = await getPollData(repo);
            ({ dailyAggData, dailyData } = prepareData(data));

            setAggregatorsCurrent(dailyData);
            demLead = getDemLead(dailyAggData)
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function setSoloAggregator(aggregator) {
        return () => {
            d3.selectAll(`circle.${aggregator}.Trump`).attr("opacity", 1).attr("r", 4).attr("stroke-width", 0);
            d3.selectAll(`circle.${aggregator}.Harris`).attr("opacity", 1).attr("r", 5).attr("fill", "transparent").attr("stroke-width", 2).attr("stroke", "blue");
            d3.selectAll(`circle:is(.Trump, .Harris):not(.${aggregator})`).attr("opacity", 0.05);
            d3.selectAll(`path:is(.Trump, .Harris)`).attr("opacity", 0.05);
        };
    }

    function removeSoloAggregator(aggregator) {
        return () => {
            d3.selectAll(`circle:is(.Trump, .Harris)`).attr("opacity", 0.2).attr("r", 3).attr("stroke-width", 0);
            d3.selectAll(`circle.background-dot:is(.Trump, .Harris)`).attr("opacity", 0.1);
            d3.selectAll(`path:is(.Trump, .Harris)`).attr("opacity", 0.425);
            d3.selectAll(`path.background-line:is(.Trump, .Harris)`).attr("opacity", 0.05);
            d3.selectAll(`circle.${aggregator}.Harris`).attr("fill", "blue");
        };
    }

    fetchData();
</script>

<article>
    <header>
        <h1>
            <span>Vox Populi</span>
            <div style="flex-grow: 1; flex-shrink: 1;"></div>
            <span>Egyesült Államok 2024</span>
        </h1>
    </header>
    <div class="uglygrid">
        <article id="winner-gauge">
            <h2>Várható győztes</h2>
            {#if demLead !== null}
                <CandidateStanding {demLead} />
            {/if}
        </article>
        <section id="poll-graph">
            <h1>Harris és Trump támogatottsága</h1>
            <p>
                Az alábbi grafikon az amerikai poll aggregátorokat (<a
                    target="_blank"
                    href="https://projects.fivethirtyeight.com/polls/president-general/2024/national/"
                    >FiveThirtyEight</a
                >,
                <a
                    target="_blank"
                    href="https://www.realclearpolling.com/polls/president/general/2024/trump-vs-harris"
                    >RealClear Polling</a
                >,
                <a
                    target="_blank"
                    href="https://www.natesilver.net/p/nate-silver-2024-president-election-polls-model"
                    >Silver Bulletin</a
                >,
                <a
                    target="_blank"
                    href="https://www.nytimes.com/interactive/2024/us/elections/polls-president.html"
                    >New York Times</a
                >) átlagolja. Lorem ipsum dolor sit amet consectetur adipisicing
                elit. Sit autem molestiae a sapiente quas! Esse deserunt
                inventore quidem ipsam labore ducimus debitis, corrupti
                blanditiis, quisquam, ipsum in consequuntur expedita reiciendis.
            </p>
            {#if aggregatorsCurrent.length !== 0}
                <div class="aggregator-bubbles">
                    {#each aggregatorsCurrent as aggregator}
                        <div class="aggregator" on:mouseenter={setSoloAggregator(aggregator.name)} on:mouseleave={removeSoloAggregator(aggregator.name)}>
                            {aggregator.displayName}
                            <span class={aggregator.leading}
                                >+{aggregator.lead.toString().replace('.', ',')}</span
                            >
                        </div>
                    {/each}
                </div>
            {/if}
            {#if dailyAggData.length !== 0 && dailyData.length !== 0}
                <Chart {dailyAggData} {dailyData} {aggregators} />
            {/if}
        </section>
        <article></article>
    </div>
</article>

<style>
    header {
        margin-bottom: 32px;
        background-color: #ddd;
        padding: 8px 16px;
        background-size: auto 800%;
        background-position: 0 50%;
        background-repeat: repeat-x;
    }
    header h1 {
        font-size: 1.2rem;
        color: #333;
        display: flex;
    }

    header h1 span {
        padding: 0 8px;
    }

    .uglygrid {
        display: grid;
        grid-template-columns: 1fr 700px;
        grid-template-rows: fit-content 1fr;
        gap: 24px;
    }

    #winner-gauge {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        height: fit-content;
        border-top: 2px solid #333;
        padding: 8px 0;
    }
    #winner-gauge .label {
        text-align: center;
        margin-top: 36px;
        font-family: 'helvetica neue';
        text-transform: uppercase;
        font-weight: 500;
        font-size: 14px;
        margin-bottom: -12px;
    }

    #poll-graph {
        grid-column: 2 / 3;
        grid-row: 1 / 3;
        border-top: 2px solid #888;
        padding: 8px 1rem;
    }
    #poll-graph .label {
        text-transform: uppercase;
        font-family: 'helvetica neue';
        font-weight: 500;
        font-size: 14px;
        margin-top: 26px;
    }

    .aggregator-bubbles {
        display: flex;
        gap: 8px;
        margin: 1rem 0;
    }

    .aggregator {
        background-color: #f7f7f7;
        padding-left: 8px;
        font-size: 14px;
        color: #666;
        cursor: default;
    }

    .aggregator span {
        font-family: "courier";
        display: inline-block;
        vertical-align: bottom;
        margin-left: 3px;
        background: transparent;
        cursor: default;
    }

    article {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding: 8px 16px;
    }

    h1 {
        font-size: 2rem;
        font-weight: 500;
    }

    h2 {
        font-size: 22px;
        font-weight: 500;
        text-align: center;
    }

    p {
        font-size: 16px;
        margin-top: 12px;
    }
</style>
