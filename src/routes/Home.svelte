<script lang="ts">
    import CandidateStanding from "../components/CandidateStanding.svelte";
    import Chart from "../components/Chart.svelte";
    import { aggregators, aggregatorNameMap } from "../lib/dataUtils";
    import { pollData, fetchPollData } from "../stores/dataStore";
    import { onMount } from "svelte";
    import AggregatorStrip from "../components/AggregatorStrip.svelte";
    import type { PollData } from "../lib/types";
    import LineChart from "../components/LineChart.svelte";

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

<article id="appContainer">
    <header>
        <h1>
            <span>Vox Populi</span>
            <div style="flex-grow: 1; flex-shrink: 1;"></div>
            <span>Egyesült Államok 2024</span>
        </h1>
    </header>
    <div id="mainGrid">
        <article id="winner-gauge">
            <h2>Várható győztes</h2>
            {#if data.demLead !== null}
                <CandidateStanding />
            {/if}
        </article>
        <section id="poll-graph">
            <h1>Harris és Trump támogatottsága</h1>
            <p>
                Az alábbi grafikon a legfontosabb amerikai poll aggregátorokat
                (<a target="_blank" href="https://projects.fivethirtyeight.com/polls/president-general/2024/national/">FiveThirtyEight</a>,
                <a target="_blank" href="https://www.realclearpolling.com/polls/president/general/2024/trump-vs-harris">RealClear Polling</a>,
                <a target="_blank" href="https://www.natesilver.net/p/nate-silver-2024-president-election-polls-model">Silver Bulletin</a>,
                <a target="_blank" href="https://www.nytimes.com/interactive/2024/us/elections/polls-president.html">New York Times</a>,
                <a target="_blank" href="https://www.economist.com/interactive/us-2024-election/trump-harris-polls/">Economist</a>)
                átlagolja. Lorem ipsum dolor sit amet consectetur adipisicing
                elit. Sit autem molestiae a sapiente quas! Esse deserunt
                inventore quidem ipsam labore ducimus debitis, corrupti
                blanditiis, quisquam, ipsum in consequuntur expedita reiciendis.
            </p>
            {#if data.dailyData.length !== 0}
                <AggregatorStrip dailyData={data.dailyData} />
                <Chart dailyData={data.dailyData} {aggregators} />
            {/if}
        </section>
        <section id="aggregator-charts" class="wide">
            <h2>Jelöltek közti különbség egyes aggregátoroknál (%)</h2>
            <div class="chart-grid">
                {#if data.dailyData.length !== 0}
                    {#each aggregators as aggregator}
                        <article>
                            <h4>{aggregatorNameMap[aggregator].full}</h4>
                            <div class="chart-container">
                                <LineChart
                                    data={data.dailyData.map((d) => { 
                                        if (!!d.Harris[aggregator] && !!d.Trump[aggregator]) {
                                            return {
                                                date: d.date,
                                                demLead: d.Harris[aggregator] - d.Trump[aggregator]
                                            }
                                        } else {
                                            return {
                                                date: d.date,
                                                demLead: undefined,
                                            }
                                        }
                                    } )}
                                    xKey="date"
                                    yKey="demLead"
                                    yDomain={[-0.06, 0.07]}
                                    xLabel="Dátum"
                                    yLabel="Demokrata vezetés"
                                />
                            </div>
                        </article>
                    {/each}
                {/if}
            </div>
        </section>
    </div>
</article>

<style lang="scss">
    #appContainer {
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding: 8px 16px;
        padding-bottom: 40vh;
    }

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

    #mainGrid {
        display: grid;
        grid-template-columns: 250px minmax(300px, 1fr);
        grid-template-rows: fit-content 1fr;
        gap: 32px;

        section.wide {
            grid-column: 1 / 3;
        }
    }

    #winner-gauge {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        height: fit-content;
        border-top: 2px solid #333;
        padding: 8px 0;
    }

    #poll-graph {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        border-top: 2px solid #888;
        padding: 8px 1rem;
    }

    #aggregator-charts {
        grid-column: 1 / 3;
        grid-row: 2 / 3;
        padding: 8px 6px;
        background-color: #f7f7f7;
        border-top: 2px solid #ddd;

        h2 {
            font-size: 16px;
            text-align: center;
            margin-bottom: 24px;
        }

        .chart-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
            margin: 1rem 0;
            
            article {
                
                h4 {
                    font-size: 0.9rem;
                    font-weight: 400;
                    margin-bottom: -18px;
                    margin-left: 32px;
                    color: #666;
                }
            }
        }
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

    h4 {
        font-size: 16px;
        font-weight: 500;
    }

    p {
        font-size: 16px;
        margin-top: 12px;
    }
</style>
