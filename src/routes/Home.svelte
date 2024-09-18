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
        <img class="headerImage" src="images/header-bg.webp" />
        <h1>
            <span><a href="https://kozvelemeny.org" target="_blank">Vox Populi:</a></span>
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
                Ábráink percrekész és minden érdemi információforrást átfogó adatokat szolgáltatnak a 2024-es amerikai elnökválasztási verseny pillanatnyi állásáról. Trendvonalat mutató ábránk Kamala Harris és Donald Trump jelenleg várható szavazatarányának alakulását követi napról-napra. „Várható győztes” ábránk pedig azt, hogy a jelenleg várható szavazatarány-különbség függvényében melyik jelölt esélyesebb arra, hogy többséget szerezzen az elnök személyéről végső soron döntő <a href="https://hu.wikipedia.org/wiki/Az_Amerikai_Egyes%C3%BClt_%C3%81llamok_elektori_koll%C3%A9giuma">elektori testületben</a>. Minden tudnivaló az ábrák alatt.
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
        position: relative;
        display: flex;
        align-items: end;
        justify-content: center;
        margin-bottom: 1rem;
        padding: 8px 16px;
        height: 160px;
    }
    header img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 0 10%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }
    header h1 {
        font-size: 2rem;
        background-color: #fff;
        color: #333;
        padding: 0 12px;
    }

    header h1 span {
        padding: 2px;
        color: blue;
        font-weight: 400;
        &:first-child {
            color: red;
        }
        a {
            text-decoration: none;
        }
    }

    #mainGrid {
        display: grid;
        grid-template-columns: 250px minmax(300px, 1fr);
        grid-template-rows: fit-content 1fr;
        gap: 0 1rem;
    }

    #winner-gauge {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        height: fit-content;
        padding: 0;
        border: 1px dashed red;
    }

    #poll-graph {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        padding: 8px 1rem;
        max-width: 700px;
        margin: 0 auto;
        border: 1px dashed blue;
        border-bottom: none;
    }

    .bodyContainer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 700px;
        line-height: 1.4;
        border: 1px dashed blue;
        border-top: none;
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
            h1 {
                font-size: 1.5rem;
            }
        }
        #mainGrid {
            grid-template-columns: 1fr;
            grid-template-rows: fit-content 1fr;
        }

        #poll-graph {
            grid-column: unset;
            grid-row: 1 / 2;
            border: none;
            padding: 0;
        }

        #winner-gauge {
            max-width: 700px;
            grid-column: unset;
            grid-row: 2 / 3;
            padding: 6px;
        }

        h1 {
            font-size: 1.5rem;
        }
    }

    @media (max-width: 500px) {
        header {
            padding: 8px;

            h1 {
                font-size: 1rem;
            }
        }
    }
</style>
