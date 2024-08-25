<script lang="ts">
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import { dynamicDayData } from "../stores/dataStore";
    import type { CandidateData, DayData } from "../lib/types";

    let dailyData: DayData | null = null;
    $: dailyData = $dynamicDayData;

    interface Aggregator {
        name: string;
        displayName: string;
        lead: number;
        leading: "dem" | "rep";
    }
    
    let aggregatorsCurrent: Aggregator[] = [];

    function setAggregatorsCurrent(day: DayData) {
        const currentTrump = day.Trump;
        const currentHarris = day.Harris;
        const aggregatorNameMap: { [key in keyof Omit<CandidateData, 'candidate' | 'date' | 'avg'>]: string } = {
            fivethirtyeight: "538",
            realclearpolling: "RCP",
            natesilver: "Silver Bulletin",
            nyt: "NYT",
        };
        aggregatorsCurrent = (Object.keys(aggregatorNameMap) as Array<keyof typeof aggregatorNameMap>).map(
            (aggregator) => {
                const trump = currentTrump[aggregator];
                const harris = currentHarris[aggregator];
                
                if (!trump || !harris) {
                    return {
                        name: aggregator,
                        displayName: aggregatorNameMap[aggregator],
                        lead: "No data",
                        leading: "",
                    };
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
                    displayName: aggregatorNameMap[aggregator],
                    lead: (lead ? "+" : "=") + Math.abs(parseFloat(lead.toFixed(1))).toString().replace(".", ","),
                    leading,
                };
            },
        );
    }

    function setSoloAggregator(aggregator: string) {
        return () => {
            d3.selectAll(`circle.${aggregator}.Trump`).attr("opacity", 1).attr("r", 4).attr("stroke-width", 0);
            d3.selectAll(`circle.${aggregator}.Harris`).attr("opacity", 1).attr("r", 5).attr("fill", "transparent").attr("stroke-width", 2).attr("stroke", "blue");
            d3.selectAll(`circle:is(.Trump, .Harris):not(.${aggregator})`).attr("opacity", 0.05);
            d3.selectAll(`path:is(.Trump, .Harris)`).attr("opacity", 0.05);
        };
    }

    function removeSoloAggregator(aggregator: string) {
        return () => {
            d3.selectAll(`circle:is(.Trump, .Harris)`).attr("opacity", 0.2).attr("r", 3).attr("stroke-width", 0);
            d3.selectAll(`circle.background-dot:is(.Trump, .Harris)`).attr("opacity", 0.1);
            d3.selectAll(`path:is(.Trump, .Harris)`).attr("opacity", 0.425);
            d3.selectAll(`path.background-line:is(.Trump, .Harris)`).attr("opacity", 0.05);
            d3.selectAll(`circle.${aggregator}.Harris`).attr("fill", "blue");
        };
    }

    $: {
        setAggregatorsCurrent(dailyData);
    }

    onMount(() => {
        setAggregatorsCurrent(dailyData);
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
        padding: 0 3px;
        background: transparent;
        cursor: default;
    }
</style>