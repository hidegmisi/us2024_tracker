<script>
    import { range } from "d3";

    export let dailyAggData;

    let demLead = 0;
    let leaderHTML = null;
    let leaderText = null;
    let leaderColor = null;

    function setDemLeadAndWinningHTML(data) {
        const lastDay = data[data.length - 1];
        const currentTrump = lastDay.Trump;
        const currentHarris = lastDay.Harris;

        demLead = currentHarris - currentTrump;

        if (demLead >= 0.04) {
            leaderHTML = "várhatóan <span class='compact dem'>Harris</span> kapja az elektori szavazatok többségét.";
            leaderText = "Harris";
            leaderColor = "#0000ff69";
        } else if (demLead < 0) {
            leaderHTML = "várhatóan <span class='compact rep'>Trump</span> kapja az elektori szavazatok többségét.";
            leaderText = "Trump";
            leaderColor = "#f00";

        } else {
            leaderHTML = "<span class='compact tossup'>szoros</span> elektori szavazatarány várható.";
            leaderText = "Bizonytalan";
            leaderColor = "#666";
        }
    }

    setDemLeadAndWinningHTML(dailyAggData);

    const demLeadBounded = Math.min(Math.max(demLead, -0.12), 0.12);

    const margin = { top: 4, right: 16, bottom: 12, left: 16 };
    const width = 250 - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    const gaugeStrokeWidth = 70;

    const radius = Math.min(width / 2, height) - gaugeStrokeWidth / 2;
    const centerX = margin.left + width / 2;
    const centerY = margin.top + height;

    const segments = [
        { label: "Likely", color: "#0000ff69", start: -12, end: -9 },
        { label: "Leaning", color: "#0000ff32", start: -9, end: -4 },
        { label: "Tossup", color: "#f7f7f7", start: -4, end: 0 },
        { label: "Leaning", color: "#ff000035", start: 0, end: 5 },
        { label: "Likely", color: "#ff000073", start: 5, end: 12 },
    ];
    
    const gaugeRange = segments[segments.length - 1].end - segments[0].start;

    const percToDeg = (perc) => perc / gaugeRange * 180;

    segments.forEach((segment, i) => {
        segment.startDeg = percToDeg(segment.start);
        segment.endDeg = percToDeg(segment.end);
    });

    function calculateCoordinates(radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    }

    function createPathD(segment, radius) {
        const startCoords = calculateCoordinates(radius, segment.startDeg);
        const endCoords = calculateCoordinates(radius, segment.endDeg);

        return `M ${startCoords.x},${startCoords.y} A ${radius} ${radius} 0 0 1 ${endCoords.x},${endCoords.y}`;
    }

    const segmentsPathD = segments.map(segment => createPathD(segment, radius));

    const arcPathD = createPathD(
        { startDeg: segments[0].startDeg, endDeg: segments[segments.length - 1].endDeg },
        radius + gaugeStrokeWidth / 2
    );

    const innerArcPathD = createPathD(
        { startDeg: segments[0].startDeg, endDeg: segments[segments.length - 1].endDeg },
        radius - gaugeStrokeWidth / 2
    );
    
    const ticks = range(-11, 12, 1);
    const majorTicks = [-9, -4, 0, 5];

    const majorTickCoordinates = majorTicks.map(tick => {
        const tickAngle = percToDeg(tick);
        const coordinates = calculateCoordinates(radius + gaugeStrokeWidth / 2 + 12, tickAngle);
        return {
            tick,
            ...coordinates,
        };
    });

    function getAngle(demLead) {
        return percToDeg(-demLead * 100);
    }

    const angle = getAngle(demLeadBounded);

    console.log(majorTickCoordinates, majorTickCoordinates[majorTickCoordinates.findIndex(majorTick => majorTick.tick === -9)]);
    
</script>

<section>
    <!-- <p id="intro">Az országos közvéleménykutatások eredményei nagyjából így fordíthatóak le az elektori szavazatokra:</p> -->
    <svg width="100%" height="150" viewBox="0 0 250 150">
        {#each segmentsPathD as pathD, i}
            <path
                d="{pathD}"
                fill="none"
                stroke={segments[i].color}
                stroke-width="{gaugeStrokeWidth}"
            />
        {/each}
        <!-- {#each segments as segment}
            {#if segment.label !== 'Tossup'}
                <text 
                    x="{calculateCoordinates(radius, (segment.start < 0 ? segment.startDeg : segment.endDeg) + 3).x}"
                    y="{calculateCoordinates(radius, (segment.start < 0 ? segment.startDeg : segment.endDeg) + 3).y}"
                    fill="#aaa"
                    font-size="10"
                    text-anchor="middle"
                    transform="rotate({(segment.start < 0 ? 90 : -90) + (segment.start < 0 ? segment.startDeg : segment.endDeg)} {calculateCoordinates(radius, (segment.start < 0 ? segment.startDeg : segment.endDeg) + 3).x} {calculateCoordinates(radius, (segment.start < 0 ? segment.startDeg : segment.endDeg) + 3).y})"
                >{segment.start < 0 ? 'Demokrata' : 'Republikánus'}</text>
            {/if}
        {/each} -->
      
        <path
            d="{arcPathD}"
            fill="none"
            stroke="#ddd"
            stroke-width="1"
        />
        
        <path
            d="{innerArcPathD}"
            fill="none"
            stroke="#ddd"
            stroke-width="1"
        />
      
        {#each ticks as tick}
            {#if majorTicks.includes(tick)}
                <text
                    x="{calculateCoordinates(radius + gaugeStrokeWidth / 2 + 12, percToDeg(tick)).x}"
                    y="{calculateCoordinates(radius + gaugeStrokeWidth / 2 + 12, percToDeg(tick)).y}"
                    fill="#aaa"
                    font-size="10"
                    text-anchor="middle"
                    dominant-baseline="mathematical"
                >{(tick ? '+' : '') + Math.abs(tick)}</text>
            {/if}
            <line
                x1="{calculateCoordinates(radius + gaugeStrokeWidth / 2 - 6, percToDeg(tick)).x}"
                y1="{calculateCoordinates(radius + gaugeStrokeWidth / 2 - 6, percToDeg(tick)).y}"
                x2="{calculateCoordinates(radius + gaugeStrokeWidth / 2, percToDeg(tick)).x}"
                y2="{calculateCoordinates(radius + gaugeStrokeWidth / 2, percToDeg(tick)).y}"
                stroke="#aaa"
                stroke-width="1"
            />
        {/each}

        <polygon
            points="{calculateCoordinates(radius + gaugeStrokeWidth / 2, 0).x},{calculateCoordinates(radius + gaugeStrokeWidth / 2, 0).y} {centerX - 6},{centerY} {centerX + 6},{centerY}"
            fill="#666"
            transform="rotate({angle} {centerX} {centerY})"
        />
        <circle cx="{centerX}" cy="{centerY}" r="8" fill="#666" style="transform: translate(0, 1px);" stroke="#fff" stroke-width="1px" />
    </svg>
    <div class="chartInfos">
        <img src="images/harris.png" alt="" class="dem">
        <h2 id="leaderText">{leaderText}</h2>
        <img src="images/trump.png" alt="" class="rep">
    </div>
    <p id="expected-result" class="has-data">
        {#if demLead == 0}
            Fej-fej mellett van a két jelölt,
        {:else}
            Nagyjából <span
            class="compact {demLead > 0 ? 'dem' : 'rep'}"
            >{Math.abs((demLead * 100).toFixed(0))}%</span
        >-os {demLead > 0 ? "demokrata" : "republikánus"} vezetésnél
        {/if}
        
        <span class="container">{@html leaderHTML}</span>
    </p>
    <p class="info">
        <span class="title">Magyarázat</span><br>
        A demokratáknak körülbelül 2%-kal kell vezetniük ahhoz, hogy az elektorok számában fej-fej mellett legyenek a republikánusokkal.<br>
        <span><a href="">Összefoglaló</a></span>
    </p>
</section>
  
<style lang="scss">
    p#intro {
        margin-top: 8px;
        font-size: 16px;
        text-align: center;
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

    svg {
        text {
            &.label {
                font-size: 12px;
                fill: #aaa;
                text-transform: uppercase;
            }
        }
    }

    .chartInfos {
        display: flex;
        justify-content: space-between;
        align-items: center;
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

        h2#leaderText {
            font-size: 1rem;
            text-align: center;
            /* color: #fff; */
            font-weight: 500;
            padding: 0 3px;
    
            span {
                &.dem, &.rep {
                    background: none;
                    padding: 0;
                }
            }
        }
    }


    p.info {
        margin: 2rem 0;
        padding: 8px 6px;
        background-color: #f7f7f7;
        border-top: 2px solid #ddd;

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

    span.dem.compact,
    span.rep.compact,
    :global(span.tossup.compact) {
        padding: 0 3px;
    }
</style>