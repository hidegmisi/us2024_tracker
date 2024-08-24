<script lang="ts">
    import Gauge from "./Gauge.svelte";

    export let demLead: number;

    let leaderHTML = "";
    let leaderText = "";
    let leaderColor = "";

    // Logic to determine the leader based on demLead
    function setDemLeadAndWinningHTML(demLead: number) {
        if (demLead >= 0.04) {
            leaderHTML =
                "várhatóan <br><span class='compact dem'>Kamala Harris</span><br> nyeri az elnökválasztást.";
            leaderText = "Harris az esélyes";
            leaderColor = "#0000ff88";
        } else if (demLead < 0) {
            leaderHTML =
                "várhatóan <br><span class='compact rep'>Donald Trump</span><br> nyeri az elnökválasztást.";
            leaderText = "Trump az esélyes";
            leaderColor = "#ff000099";
        } else {
            leaderHTML =
                "<span class='compact tossup'>szoros</span> elektori szavazatarány várható.";
            leaderText = "Bizonytalan";
            leaderColor = "#666";
        }
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
                minValue={-12}
                maxValue={12}
                segments={[
                    { start: -12, end: -9, color: "#0000ff69", label: "Likely Dem" },
                    { start: -9, end: -4, color: "#0000ff32", label: "Leaning Dem" },
                    { start: -4, end: 0, color: "#f7f7f7", label: "Tossup" },
                    { start: 0, end: 5, color: "#ff000035", label: "Leaning Rep" },
                    { start: 5, end: 12, color: "#ff000073", label: "Likely Rep" },
                ]}
                strokeWidth={70}
                tickInterval={1}
                majorTicks={[-9, -4, 0, 5]}
            />
        </div>
        <div class="chartInfos">
            <img src="images/harris.png" alt="Harris" class="dem" />
            <div class="textContainer">
                <h2 id="leaderText">{leaderText}</h2>
            </div>
            <img src="images/trump.png" alt="Trump" class="rep" />
        </div>
        <p>
            A demokratáknak körülbelül 2%-kal kell vezetniük ahhoz, hogy az elektorok számában fej-fej mellett legyenek a republikánusokkal.<br>
        </p>
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
                /* color: #fff; */
                font-weight: 500;
                padding: 2px 3px;
        
                span {
                    &.dem, &.rep {
                        background: none;
                        padding: 0;
                    }
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
