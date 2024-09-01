<script lang="ts">
    import Gauge from "./Gauge.svelte";
    import { dynamicDayData, calculateDemLead } from "../stores/dataStore";
    import type { Segment } from "../lib/types";
    
    let demLead: number = 0;

    $: demLead = $dynamicDayData ? calculateDemLead($dynamicDayData) : 0;

    let leaderHTML = "";
    let leaderText = "";
    let leaderColor = "";
    let currentStanding = "";

    const segments: Segment[] = [
        { start: -7, end: -6, color: "#0000ff69", leadingParty: "dem", probability: 0.997 },
        { start: -6, end: -5, color: "#0000ff32", leadingParty: "dem", probability: 0.991 },
        { start: -5, end: -4, color: "#0000ff32", leadingParty: "dem", probability: 0.959 },
        { start: -4, end: -3, color: "#0000ff32", leadingParty: "dem", probability: 0.87 },
        { start: -3, end: -2, color: "#0000ff32", leadingParty: "dem", probability: 0.621 },
        { start: -2, end: -1, color: "#ff000035", leadingParty: "rep", probability: 0.306 },
        { start: -1, end: 0, color: "#ff000035", leadingParty: "rep", probability: 0.892 },
        { start: 0, end: 1, color: "#ff000035", leadingParty: "rep", probability: 0.971 },
        { start: 1, end: 2, color: "#ff000035", leadingParty: "rep", probability: 0.996 },
        { start: 2, end: 3, color: "#ff000035", leadingParty: "rep", probability: 0.999 },
        { start: 3, end: 7, color: "#ff000073", leadingParty: "rep", probability: 1 },
    ]

    $: setDemLeadAndWinningHTML(demLead);

    // Logic to determine the leader based on demLead
    function setDemLeadAndWinningHTML(demLead: number) {
        const band = segments.find((segment) => -demLead * 100 >= segment.start && -demLead * 100 < segment.end);
        if (band) {
            leaderHTML = `várhatóan <br><span class='compact ${band.leadingParty}'>${band.leadingParty === "dem" ? "Kamala Harris" : "Donald Trump"}</span><br> nyeri az elnökválasztást.`;
            leaderText = band.leadingParty === "dem" ? "Harris" : "Trump";
            leaderColor = band.leadingParty === "dem" ? "#0000ff" : "#ff0000";
        } else if (demLead >= 0.07) {
            leaderHTML = `várhatóan <br><span class='compact dem'>Kamala Harris</span><br> nyeri az elnökválasztást.`;
            leaderText = "Harris";
            leaderColor = "#0000ff";
        } else if (demLead <= -7) {
            leaderHTML = `várhatóan <br><span class='compact rep'>Donald Trump</span><br> nyeri az elnökválasztást.`;
            leaderText = "Trump";
            leaderColor = "#ff0000";
        }

        if (band?.probability < 0.4) {
            leaderHTML = `valószínűleg <br><span class='compact tossup'>fej fej mellett</span><br> vannak a jelöltek.`;
            leaderText = "Bizonytalan";
            leaderColor = "#333";
        }

        currentStanding = (demLead > 0 ? "Harris +" : demLead < 0 ? "Trump +" : "") + Math.abs(demLead * 100).toFixed(1).replace(".", ",");
    }

    setDemLeadAndWinningHTML(demLead);
</script>

<section>
    <p id="expected-result" class="has-data">
        {#if demLead == 0}
            Fej-fej mellett van a két jelölt,
        {:else}
            Nagyjából <span class="compact {demLead > 0 ? 'dem' : 'rep'}"
                >{Math.abs(demLead * 100).toFixed(0)}%</span
            >-os {demLead > 0 ? "demokrata" : "republikánus"} vezetésnél
        {/if}
        <span class="container">{@html leaderHTML}</span>
    </p>
    <div class="info">
        <div id="gaugeContainer">
            <Gauge
                value={-demLead * 100}
                minValue={-7}
                maxValue={7}
                segments={[
                    { start: -7, end: -6, color: "#0000ff69", leadingParty: "dem", probability: 0.997 },
                    { start: -6, end: -5, color: "#0000ff32", leadingParty: "dem", probability: 0.991 },
                    { start: -5, end: -4, color: "#0000ff32", leadingParty: "dem", probability: 0.959 },
                    { start: -4, end: -3, color: "#0000ff32", leadingParty: "dem", probability: 0.87 },
                    { start: -3, end: -2, color: "#0000ff32", leadingParty: "dem", probability: 0.621 },
                    { start: -2, end: -1, color: "#ff000035", leadingParty: "rep", probability: 0.306 },
                    { start: -1, end: 0, color: "#ff000035", leadingParty: "rep", probability: 0.892 },
                    { start: 0, end: 1, color: "#ff000035", leadingParty: "rep", probability: 0.971 },
                    { start: 1, end: 2, color: "#ff000035", leadingParty: "rep", probability: 0.996 },
                    { start: 2, end: 3, color: "#ff000035", leadingParty: "rep", probability: 0.999 },
                    { start: 3, end: 7, color: "#ff000073", leadingParty: "rep", probability: 1 },
                ]}
                strokeWidth={70}
                tickInterval={1}
                majorTicks={[-4, -2, 0, 2, 4]}
            />
        </div>
        <div class="chartInfos">
            <img src="images/harris.png" alt="Harris" class="dem" />
            <div class="textContainer">
                <h2 id="leaderText" style="color: {leaderColor}">{leaderText}</h2>
                <div class="standing">
                    {(demLead > 0 ? "Harris" : demLead < 0 ? "Trump" : "")}
                    <span class="compact { demLead > 0 ? "dem" : demLead < 0 ? "rep" : "" }">+{Math.abs(demLead * 100).toFixed(1).replace(".", ",")}</span>
                </div>
            </div>
            <img src="images/trump.png" alt="Trump" class="rep" />
        </div>
        <p>A demokraták akkor esélyesek több elektori szavazotot kapni, ha több, mint 2%-kal nyernek az országos választáson.</p>
        <p class="source">Forrás: <a href="https://www.natesilver.net/p/pennsylvania-may-be-a-problem-for?utm_source=substack&publication_id=1198116&post_id=148272825&utm_medium=email&utm_content=share&utm_campaign=email-share&triggerShare=true&isFreemail=true&r=2juryv&triedRedirect=true">Nate Silver</a></p>
        <p><a href="https://24.hu/kulfold/2020/07/27/amerikai-elnokvalasztas-elektori-rendszer-magyarazo-kisokos/">A választási rendszerről
        </a></p>
    </div>
</section>

<style lang="scss">
    #gaugeContainer {
        margin-top: -12px;
        width: 100%;
        aspect-ratio: 250 / 150;
    }

    p#expected-result {
        text-align: center;
        font-size: 1.2rem;
        margin-top: 24px;

        :global(:is(.dem, .rep, .tossup)) {
            font-weight: 600;
            font-family: 'baskerville';
        }
    }

    .chartInfos {
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
            align-self: center;
            
            h2#leaderText {
                font-size: 1rem;
                text-align: center;
                font-weight: 600;
                padding: 2px 3px;
                padding-bottom: 0;
            }
            .standing {
                font-size: 0.9rem;
                text-align: center;

                span {
                    background: none;
                    padding: 0;
                }
            }
        }

    }


    .info {
        margin: 2rem 0;
        padding: 8px 6px;
        background-color: #f7f7f7;
        border-top: 2px solid #ddd;

        p {
            border-top: 1px solid #eee;
            padding-top: 6px;
            margin-top: 12px;

            &.source {
                border-top: none;
                padding-top: 0;
            }

            span {
                display: inline-block;
                margin-top: 8px;
            }
    
            span.title {
                margin-top: 0;
                margin-bottom: 6px;
                font-weight: 600;
            }
        }

    }

    span.dem.compact,
    span.rep.compact,
    :global(span.tossup.compact) {
        padding: 0 3px;
    }
</style>
