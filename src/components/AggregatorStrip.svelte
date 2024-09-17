<script lang="ts">
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import { dynamicDayData } from "../stores/dataStore";
    import type { CandidateData, DayData } from "../lib/types";
    import { aggregatorNameMap } from "../lib/dataUtils";

    let lastDayData: DayData | null = null;
    $: lastDayData = $dynamicDayData;

    export let dailyData: DayData[] = [];

    let screenSize;

    interface AggregatorObject {
        name: string;
        displayName: string;
        lead: number;
        leading: "dem" | "rep";
    }
    
    let aggregatorsCurrent: AggregatorObject[] = [];

    function setAggregatorsCurrent(day: DayData, dailyData: DayData[]) {
        const currentTrump = day.Trump;
        const currentHarris = day.Harris;
        aggregatorsCurrent = (Object.keys(aggregatorNameMap) as Array<keyof typeof aggregatorNameMap>).map(
            (aggregator) => {
                let trump = currentTrump[aggregator];
                let harris = currentHarris[aggregator];
                
                if (!trump || !harris) {
                    // find last day with data for this aggregator
                    const lastDayWithAggregator = dailyData.slice().reverse().find((day) => day.Trump[aggregator] && day.Harris[aggregator]);
                    if (!lastDayWithAggregator) {
                        return {
                            name: aggregator,
                            displayName: aggregatorNameMap[aggregator].abv,
                            lead: "No data",
                            leading: "",
                        };
                    }

                    trump = lastDayWithAggregator.Trump[aggregator];
                    harris = lastDayWithAggregator.Harris[aggregator];
                }
                
                const lead = (harris - trump) * 100;

                let leading = ""
                if (lead > 0) {
                    leading = "dem";
                } else if (lead < 0) {
                    leading = "rep";
                }

                return {
                    name: aggregator,
                    className: aggregatorNameMap[aggregator].className,
                    displayName: aggregatorNameMap[aggregator].abv,
                    lead: (lead ? "+" : "=") + Math.abs(parseFloat(lead.toFixed(1))).toString().replace(".", ","),
                    leading,
                };
            },
        );
    }

    function setSoloAggregator(aggregator: string) {
        return () => {
            if (screenSize < 500) {
                d3.selectAll(`circle.${aggregator}.Trump`).attr("opacity", 1).attr("r", 2).attr("stroke-width", 0);
                d3.selectAll(`circle.${aggregator}.Harris`).attr("opacity", 1).attr("r", 2).attr("stroke-width", 0);
            } else {
                d3.selectAll(`circle.${aggregator}.Trump`).attr("opacity", 1).attr("r", 3).attr("stroke-width", 0);
                d3.selectAll(`circle.${aggregator}.Harris`).attr("opacity", 1).attr("r", 4).attr("fill", "transparent").attr("stroke-width", 1.5).attr("stroke", "blue");
            }
            d3.selectAll(`circle:is(.Trump, .Harris):not(.${aggregator})`).attr("opacity", 0.05);
            d3.selectAll(`path:is(.Trump, .Harris)`).attr("opacity", 0.05);
        };
    }

    function removeSoloAggregator(aggregator: string) {
        return () => {
            if (screenSize < 500) {
                d3.selectAll(`circle:is(.Trump, .Harris)`).attr("opacity", 0.12).attr("r", 2).attr("stroke-width", 0);
            } else {
                d3.selectAll(`circle:is(.Trump, .Harris)`).attr("opacity", 0.12).attr("r", 3).attr("stroke-width", 0);
            }
            d3.selectAll(`circle.background-dot:is(.Trump, .Harris)`).attr("opacity", 0.03);
            d3.selectAll(`path:is(.Trump, .Harris)`).attr("opacity", 0.425);
            d3.selectAll(`path.background-line:is(.Trump, .Harris)`).attr("opacity", 0.05);
            d3.selectAll(`circle.${aggregator}.Harris`).attr("fill", "blue");
        };
    }

    $: {
        setAggregatorsCurrent(lastDayData, dailyData);
    }

    onMount(() => {
        setAggregatorsCurrent(lastDayData, dailyData);
        
        screenSize = window.innerWidth;

        window.addEventListener("resize", () => {
            screenSize = window.innerWidth;
        });
    });
</script>

{#if aggregatorsCurrent.length !== 0}
    <div class="aggregator-bubbles">
        {#each aggregatorsCurrent as aggregator}
            <div class="aggregator" role="button" tabindex="0" on:mouseenter={setSoloAggregator(aggregator.name)} on:mouseleave={removeSoloAggregator(aggregator.name)}>
                {aggregator.displayName}
                <span class={aggregator.leading}>{aggregator.lead}</span>
            </div>
        {/each}
    </div>
{/if}

<style lang="scss">
    .aggregator-bubbles {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 1rem 0;
    }

    .aggregator {
        flex-basis: calc(50% - 4px);
        border: 1px solid #00f2;
        padding: 6px 12px;
        border-radius: 1rem;
        font-size: 14px;
        color: #666;
        cursor: default;
    }

    .aggregator span {
        float: right;
        font-family: "courier";
        display: inline-block;
        vertical-align: bottom;
        margin-left: 3px;
        padding: 0 3px;
        background: transparent;
        cursor: default;
    }

    @media (min-width: 500px) {
        .aggregator {
            flex-basis: unset;

            span {
                float: none;
            }
        }
    }
</style>