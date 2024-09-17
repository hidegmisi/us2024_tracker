<script lang="ts">
    import Gauge from "./Gauge.svelte";
    import { dynamicDayData, calculateDemLead } from "../stores/dataStore";
    import type { Segment } from "../lib/types";
    
    let demLead: number = 0;

    $: demLead = $dynamicDayData ? calculateDemLead($dynamicDayData) : 0;
    $: displayDate = ($dynamicDayData ? new Date($dynamicDayData.date) : new Date()).toLocaleDateString('hu-HU', {month: 'short', day: 'numeric'}).slice(0, -1) + ':';

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

<section id="candidateStanding">
    <div class="info">
        <main>
            <p class="label"><strong>Szavazatarány-különbség,<br>{displayDate}</strong> {(demLead > 0 ? "Harris" : demLead < 0 ? "Trump" : "")} <span class="compact { demLead > 0 ? "dem" : demLead < 0 ? "rep" : "" }">+{Math.abs(demLead * 100).toFixed(1).replace(".", ",")}</span></p>
            <div id="gaugeContainer">
                <Gauge
                    value={-demLead * 100}
                    minValue={-7}
                    maxValue={7}
                    segments={segments}
                    strokeWidth={70}
                    tickInterval={1}
                    majorTicks={[-4, -2, 0, 2, 4]}
                />
            </div>
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
        </main>
        <div class="textContainer">
            <h2>Várható győztes</h2>
            <p>
                Ábránk Nate Silver becsléseire támaszkodó saját ítéletünket mutatja arról, hogy a melyik jelölt esélyesebb éppen az Elektori Kollégiumban aratott győzelemre.
            </p>
        </div>
        <p>Harris akkor <a href="https://www.natesilver.net/p/pennsylvania-may-be-a-problem-for?utm_source=substack&publication_id=1198116&post_id=148272825&utm_medium=email&utm_content=share&utm_campaign=email-share&triggerShare=true&isFreemail=true&r=2juryv&triedRedirect=true">esélyesebb</a> Trumpnál, ha több, mint 2,5%-kal vezet az országos szavazatarány tekintetében.</p>
    </div>
</section>

<style lang="scss">
    #candidateStanding {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1fr;
        margin: 0 auto;

        padding: 8px 6px;
    }

    .textContainer {
        display: flex;
        flex-direction: column;

        h2 {
            font-size: 22px;
            font-weight: 500;
        }
    }


    #gaugeContainer {
        width: 100%;
        max-width: 250px;
        margin: 0 auto;
        aspect-ratio: 250 / 150;
    }

    p#expected-result {
        font-size: 1.2rem;
        margin-top: 24px;

        :global(:is(.dem, .rep, .tossup)) {
            font-weight: 600;
            font-family: 'baskerville';
        }
    }

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


    .info {
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr;

        main {
            margin-top: 12px;
            grid-row: span 2;
            max-height: fit-content;
            border-top: 1px solid #00f2;
            border-bottom: 1px solid #00f2;
            padding: 8px 0;
            padding-bottom: 1rem;

            .label {
                font-family: 'Helvetica Neue';
                margin: 3px;
                font-size: 0.8rem;
                color: #666;
                text-align: center;

                strong {
                    font-weight: 500;
                }
                
                & > * {
                    font-family: 'Helvetica Neue';
                    &:not(.compact) {
                        color: #666;
                    }
                }

                br {
                    display: none;
                }
            }
        }

        & > .textContainer {
            grid-row: 1 / 2;

            p {
                margin-top: 12px;
            }
        }

        & > p {
            margin-top: 12px;

            &.source {
                border-top: none;
                padding-top: 0;
            }

            span {
                /* display: inline-block; */
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

    @media (min-width: 480px) {
        .info {
            max-width: 700px;
            grid-template-columns: 250px 1fr;
            gap: 0 1rem;
            border: none;
            background-color: unset;

            & > .textContainer {
                grid-row: unset;
            }

            main {
                margin-top: 0;
                height: fit-content;
                border: 1px solid #00f2;

                .label {
                    br {
                        display: unset;
                    }
                }
                #gaugeContainer {
                    background-color: unset;
                    border-top: unset;
                }
            }

            & > p {
                height: 130px;
                border-top: none;
                padding-top: 0;
            }
        }
    }

    @media (min-width: 900px) {
        #candidateStanding {
            grid-template-columns: 1fr;
            background-color: unset;
            border-top: unset;
        }

        .textContainer {
            padding: 0;
        }
        
        .info {
            grid-template-columns: 1fr;
            gap: 0;

            & > .textContainer {
                grid-row: 1 / 2;
                align-items: center;
            }

            main {
                margin-top: 1rem;
                border-left: none;
                border-right: none;
            }

            & > p {
                margin-top: 12px;
                margin-bottom: 2px;
                height: unset;
            }
            
        }
    }
</style>
