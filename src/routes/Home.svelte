<script lang="ts">
    import CandidateStanding from "../components/CandidateStanding.svelte";
    import Chart from "../components/Chart.svelte";
    import { aggregators, aggregatorNameMap } from "../lib/dataUtils";
    import { pollData, fetchPollData } from "../stores/dataStore";
    import { onMount } from "svelte";
    import AggregatorStrip from "../components/AggregatorStrip.svelte";
    import type { PollData } from "../lib/types";
    import { body } from "$lib/content/mainBody"

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
            {#if data.demLead !== null}
                <CandidateStanding />
            {/if}
        </article>
        <section id="poll-graph">
            <h1>Harris és Trump támogatottsága</h1>
            <p>
                Ábráink percrekész és minden érdemi információforrást átfogó adatokat szolgáltatnak a 2024-es amerikai elnökválasztási verseny pillanatnyi állásáról. Trendvonalat mutató ábránk Kamala Harris és Donald Trump pillanatnyilag várható szavazatarányának alakulását követi napról-napra. „Várható győztes” ábránk pedig azt, hogy a pillanatnyilag várható szavazatarány-különbség függvényében melyik jelölt esélyesebb arra, hogy többséget szerezzen az elnök személyéről végső soron döntő <a href="https://hu.wikipedia.org/wiki/Az_Amerikai_Egyes%C3%BClt_%C3%81llamok_elektori_koll%C3%A9giuma">elektori testületben</a>. Minden tudnivaló az ábrák alatt.
            </p>
            {#if data.dailyData.length !== 0}
                <AggregatorStrip dailyData={data.dailyData} />
                <Chart dailyData={data.dailyData} {aggregators} />
            {/if}
        </section>
        <article></article>
        <article class="bodyContainer">
            {@html body}
        </article>
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
        gap: 0 32px;
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
        max-width: 700px;
        margin: 0 auto;
    }

    .bodyContainer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 700px;
        line-height: 1.4;
    }

    :global(.bodyContainer p) {
        /* font-size: 18px; */
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

    @media (max-width: 900px) {
        header {
            padding: 8px;

            h1 {
                font-size: 1rem;
            }
        }
        #mainGrid {
            grid-template-columns: 1fr;
            grid-template-rows: fit-content 1fr;
        }

        #poll-graph {
            grid-column: unset;
            grid-row: 1 / 2;
            border-top: none;
            padding: 0;
        }

        #winner-gauge {
            max-width: 700px;
            grid-column: unset;
            grid-row: 2 / 3;
            border-top: none;
            padding: 6px;
            border-top: 1px solid blue;
            border-left: 1px solid blue;
            border-right: 1px solid red;
            border-bottom: 1px solid red;
        }

        h1 {
            font-size: 1.5rem;
        }
    }
</style>
