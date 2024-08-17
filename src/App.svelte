<script>
    import * as d3 from "d3";
    import Gauge from "./components/Gauge.svelte";

    export let repo = "hidegmisi/us2024_aggregator_scraper";

    let demLead = null;
    let leadHTML = null;
    let aggregatorsCurrent = [];

    const colors = {
        Trump: "red",
        Harris: "blue",
    };

    const aggregators = [
        "fivethirtyeight",
        "realclearpolling",
        "natesilver",
        "nyt",
    ];

    async function fetchPollData(repo) {
        const response = await fetch(
            `https://api.github.com/repos/${repo}/contents/polls.csv`,
        );
        const json = await response.json();
        const csvData = atob(json.content);
        return d3.csvParse(csvData);
    }

    function isDataStale() {
        const oneHour = 1000 * 60 * 60;
        const now = new Date();
        const lastUpdated = new Date(
            sessionStorage.getItem("pollsDataUpdated"),
        );
        const diff = now - lastUpdated;

        return (
            sessionStorage.getItem("pollsData") == null ||
            sessionStorage.getItem("pollsDataUpdated") == null ||
            diff >= oneHour
        );
    }

    async function getPollData(repo) {
        if (isDataStale()) {
            const pollData = await fetchPollData(repo);
            const now = new Date();
            sessionStorage.setItem("pollsData", JSON.stringify(pollData));
            sessionStorage.setItem("pollsDataUpdated", now);
            return pollData;
        } else {
            return JSON.parse(sessionStorage.getItem("pollsData"));
        }
    }

    function prepareData(data) {
        const candidates = ["Trump", "Harris"];

        data.forEach((d) => {
            aggregators.forEach((p) => {
                d[p] = d[p] || null;
            });
        });

        const dates = Array.from(new Set(data.map((d) => d.date)));

        const dailyCandidateData = dates.map((date) => {
            const dateData = data.filter((d) => d.date === date);
            const candidateData = candidates.map((candidate) => {
                const candidatePolls = dateData.filter(
                    (d) => d.candidate === candidate,
                );
                const aggregatorData = Object.fromEntries(
                    aggregators.map((p) => [
                        p,
                        d3.mean(candidatePolls.map((d) => d[p])),
                    ]),
                );

                return {
                    candidate,
                    date,
                    ...aggregatorData,
                    avg: d3.mean(aggregators.map((p) => aggregatorData[p])),
                };
            });
            return Object.fromEntries(
                candidateData.map((d) => [d.candidate, d]),
            );
        });

        const dailyCandidateAgg = dailyCandidateData.map((d) => {
            const trump = d.Trump;
            const harris = d.Harris;

            return {
                date: trump.date,
                Trump: d3.mean(aggregators.map((p) => trump[p])).toFixed(4),
                Harris: d3.mean(aggregators.map((p) => harris[p])).toFixed(4),
            };
        });

        return {
            dailyAggData: dailyCandidateAgg,
            dailyData: dailyCandidateData,
        };
    }

    function setDemLeadAndWinningHTML(data) {
        const lastDay = data[data.length - 1];
        const currentTrump = lastDay.Trump;
        const currentHarris = lastDay.Harris;

        demLead = currentHarris - currentTrump;

        if (demLead >= 0.04) {
            leadHTML =
                "valószínűleg a <span class='dem'>demokraták</span> fognak nyerni választáson.";
        } else if (demLead < 0) {
            leadHTML =
                "valószínűleg a <span class='rep'>republikánusok</span> fognak nyerni választáson.";
        } else {
            leadHTML =
                "<span class='contest'>szoros</span> eredmény várható a választáson.";
        }
    }

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
                    lead: Math.abs(lead.toFixed(2)),
                    leading: lead > 0 ? "dem" : "rep",
                };
            },
        );
    }

    async function fetchData() {
        try {
            const data = await getPollData(repo);
            const { dailyAggData, dailyData } = prepareData(data);

            setDemLeadAndWinningHTML(dailyAggData);
            setAggregatorsCurrent(dailyData);

            drawChart(dailyAggData, dailyData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function drawChart(dailyAggData, dailyData) {
        const { margin, width, height, x, y, chartGroup } =
            setupChart(dailyData);

        drawLines(chartGroup, dailyAggData, x, y);
        drawDots(chartGroup, dailyData, x, y);
        drawGridlines(chartGroup, x, y, width, height);
        setupInteractivity(chartGroup, dailyData, x, y, width, height);
    }

    function setupChart(dailyData) {
        const margin = { top: 20, right: 0, bottom: 30, left: 0 };
        const svg = d3.select("svg");
        const width = parseInt(svg.style("width")) - margin.left - margin.right;
        const height = width * (4 / 7);

        const dateExtent = d3.extent(dailyData, (d) => d3.timeParse("%Y-%m-%d")(d.Trump.date));

        const paddedStartDate = new Date(dateExtent[0]);
        paddedStartDate.setDate(paddedStartDate.getDate() - 1); // Subtract one day

        // Set the domain with the padded start date
        const x = d3
            .scaleTime()
            .domain([paddedStartDate, dateExtent[1]])
            .range([0, width - 150]);

        const y = d3.scaleLinear().domain([0.35, 0.51]).range([height, 0]);

        const chartGroup = svg
            .attr(
                "viewBox",
                `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
            )
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g");

        return { margin, width, height, x, y, chartGroup };
    }

    function drawLines(chartGroup, dailyAggData, x, y) {
        for (const candidate of ["Trump", "Harris"]) {
            const line = d3
                .line()
                .x((d) => x(d.date))
                .y((d) => y(d.avg))
                .curve(d3.curveMonotoneX);

            chartGroup
                .append("path")
                .datum(
                    dailyAggData.map((d) => ({
                        date: d3.timeParse("%Y-%m-%d")(d.date),
                        avg: d[candidate],
                    })),
                )
                .attr("class", candidate)
                .attr("fill", "none")
                .attr("stroke", colors[candidate])
                .attr("stroke-width", 9)
                .attr("opacity", 0.45)
                .attr("d", line);
        }
    }

    function drawDots(chartGroup, dailyData, x, y) {
        const circleGroup = chartGroup.append("g");

        dailyData.forEach((d) => {
            for (const candidate of ["Trump", "Harris"]) {
                aggregators.forEach((aggregator) => {
                    if (!d[candidate][aggregator]) return;

                    circleGroup
                        .append("circle")
                        .attr("class", aggregator + " " + candidate)
                        .attr(
                            "cx",
                            x(d3.timeParse("%Y-%m-%d")(d[candidate].date)),
                        )
                        .attr("cy", y(d[candidate][aggregator]))
                        .attr("r", 3)
                        .attr("fill", colors[candidate])
                        .attr("opacity", 0.3)
                        .attr("stroke", "white")
                        .attr("stroke-width", 0)
                        .attr("paint-order", "stroke")
                });
            }
        });
    }

    function drawGridlines(chartGroup, x, y, width, height) {
        chartGroup
            .append("g")
            .attr("class", "grid x-grid")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(d3.timeWeek.every(1))
                    .tickSizeInner(-6)
                    .tickPadding(10)
                    .tickFormat((d) =>
                        new Date(d).toLocaleDateString("hu-HU", {
                            month: "short",
                            day: "numeric",
                        }),
                    ),
            )
            .call((g) => g.select(".domain").remove())
            .selectAll("line")
            .style("stroke", "#ccc")
            .style("stroke-opacity", 1);

        chartGroup.selectAll(".x-grid").selectAll("text");

        chartGroup
            .append("g")
            .attr("class", "grid y-grid")
            .call(
                d3
                    .axisLeft(y)
                    .tickValues([0.35, 0.4, 0.45, 0.5])
                    .tickSize(-width)
                    .tickFormat((d) => `${d * 100}`),
            )
            .call((g) => g.select(".domain").remove())
            /* .call((g) => g.selectAll(".tick:last-child text").remove()) */
            .selectAll("line")
            .style("stroke", "#ddd")
            .style("stroke-opacity", 1);

        chartGroup
            .selectAll(".y-grid")
            .selectAll("text")
            .attr("dx", "1.5em")
            .attr("dy", "-0.5em");

        chartGroup
            .selectAll(".tick")
            .selectAll("text")
            .style("font-size", "14px")
            .style("color", "#666");
        //.style("font-family", "courier");
    }

    function setupInteractivity(chartGroup, dailyData, x, y, width, height) {
        const focusDate = chartGroup
            .append("g")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("x1", width - 151)
            .attr("x2", width - 151);

        const verticalLine = focusDate
            .append("line")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("y1", 0)
            .attr("y2", height)
            .attr("x1", width - 151)
            .attr("x2", width - 151);

        const dateLabel = focusDate
            .append("text")
            .attr("text-anchor", "middle")
            .style("fill", "#333")
            .text(
                new Date().toLocaleDateString("hu-HU", {
                    month: "long",
                    day: "numeric",
                }),
            );

        chartGroup
            .append("rect")
            .attr("class", "overlay-box")
            .attr("x", width - 150)
            .attr("y", 0)
            .attr("width", 100)
            .attr("height", height)
            .attr("fill", "white")
            .attr("opacity", 0.8);

        dateLabel.attr("x", width - 150).attr("y", -6);

        const focusTexts = initializeFocusTexts(chartGroup, colors);
        updateLabels(focusTexts, dailyData, x, y);

        const svg = d3.select(chartGroup.node().parentNode);

        svg.append("rect")
            .attr("width", width - 150)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", () => {
                Object.values(focusTexts).forEach((text) =>
                    text.attr("opacity", 1),
                );
            })
            .on("mousemove", function (event) {
                handleMouseMove(
                    event,
                    chartGroup,
                    dailyData,
                    x,
                    y,
                    width,
                    height,
                    verticalLine,
                    dateLabel,
                    focusTexts,
                );
            })
            .on("mouseout", () => {
                verticalLine
                    .attr("y1", 0)
                    .attr("y2", height)
                    .attr("x1", width - 151)
                    .attr("x2", width - 151);

                dateLabel
                    .text(
                        new Date().toLocaleDateString("hu-HU", {
                            month: "long",
                            day: "numeric",
                        }),
                    )
                    .attr("x", width - 151)
                    .attr("y", -6);

                updateLabels(focusTexts, dailyData, x, y);

                chartGroup.selectAll(".overlay-box").remove(); // Clear existing box
                chartGroup
                    .append("rect")
                    .attr("class", "overlay-box")
                    .attr("x", width - 150)
                    .attr("y", 0)
                    .attr("width", 100)
                    .attr("height", height)
                    .attr("fill", "white")
                    .attr("opacity", 0.8);
                Object.values(focusTexts).forEach((text) => text.raise());
            });
    }

    function initializeFocusTexts(chartGroup, colors) {
        const focusTexts = {};
        Object.keys(colors).forEach((candidate) => {
            focusTexts[candidate] = chartGroup
                .append("text")
                .attr("class", candidate)
                .attr("text-anchor", "left")
                .attr("alignment-baseline", "middle")
                .style("font-size", "1.5rem")
                .style("stroke", "#fff")
                .style("stroke-width", 6)
                .attr("paint-order", "stroke");
        });
        return focusTexts;
    }

    function handleMouseMove(
        event,
        chartGroup,
        dailyData,
        x,
        y,
        width,
        height,
        verticalLine,
        dateLabel,
        focusTexts,
    ) {
        const mouse = d3.pointer(event);
        const mouseDate = x.invert(mouse[0]);
        const roundedDate = new Date(mouseDate);
        roundedDate.setHours(0, 0, 0, 0);
        if (mouseDate.getHours() >= 12) {
            roundedDate.setDate(roundedDate.getDate() + 1);
        }
        const lineDate = new Date(roundedDate.getTime()); // Subtract 1 day from the date
        verticalLine.attr("x1", x(lineDate) - 1).attr("x2", x(lineDate));
        dateLabel
            .text(
                roundedDate.toLocaleDateString("hu-HU", {
                    month: "long",
                    day: "numeric",
                }),
            )
            .attr("x", x(lineDate));

        // Add half-opaque white box to the right of the vertical line
        chartGroup.selectAll(".overlay-box").remove(); // Clear existing box
        chartGroup
            .append("rect")
            .attr("class", "overlay-box")
            .attr("x", x(lineDate))
            .attr("y", 0)
            .attr("width", width - x(lineDate))
            .attr("height", height)
            .attr("fill", "white")
            .attr("opacity", 0.8);

        // Put the labels at the end of the svg rendering order
        Object.values(focusTexts).forEach((text) => text.raise());

        updateLabels(focusTexts, dailyData, x, y, lineDate);
        fixLabelPositions(focusTexts, x, y, width, height);
    }

    function updateLabels(focusTexts, dailyData, x, y, lineDate = null) {
        if (!lineDate) {
            lineDate = d3.max(dailyData.map((d) => d.Trump.date));
        }

        let closestValue = { Trump: null, Harris: null };
        let minDiff = { Trump: Infinity, Harris: Infinity };

        // Find the closest data point for each candidate
        dailyData.forEach((day) => {
            for (const candidate of ["Trump", "Harris"]) {
                const candidateObj = day[candidate];

                const diff = Math.abs(
                    new Date(lineDate) - new Date(candidateObj.date),
                );

                if (diff < minDiff[candidate]) {
                    closestValue[candidate] = candidateObj;
                    minDiff[candidate] = diff;
                }

                // Update focus text
                if (closestValue[candidate]) {
                    focusTexts[candidate]
                        .text(`${candidate} `)
                        .attr(
                            "x",
                            x(new Date(closestValue[candidate].date)) + 8,
                        )
                        .attr("y", y(closestValue[candidate].avg))
                        .append("tspan")
                        .text(
                            `${(closestValue[candidate].avg * 100).toFixed(1).replace('.', ',')}`,
                        )
                        .attr(
                            "style",
                            `fill: ${colors[candidate]}; font-weight: 500; /* font-family: 'courier'; */ dominant-baseline: middle;`,
                        );
                }
            }
        });
    }

    function fixLabelPositions(focusTexts, x, y, width, height) {
        const y_positions = Object.values(focusTexts).map((text) =>
            parseFloat(text.attr("y")),
        );
        const difference = Math.abs(y_positions[0] - y_positions[1]);
        const average_y = (y_positions[0] + y_positions[1]) / 2;

        if (difference < 30) {
            const topCandidate =
                y_positions[0] > y_positions[1] ? "Trump" : "Harris";
            const bottomCandidate =
                y_positions[0] > y_positions[1] ? "Harris" : "Trump";

            focusTexts[topCandidate].attr("y", average_y + 15);
            focusTexts[bottomCandidate].attr("y", average_y - 15);
        }
    }

    function setSoloAggregator(aggregator) {
        return () => {
            d3.selectAll(`circle.${aggregator}.Trump`).attr("opacity", 1).attr("r", 4).attr("stroke-width", 0);
            d3.selectAll(`circle.${aggregator}.Harris`).attr("opacity", 1).attr("r", 5).attr("fill", "transparent").attr("stroke-width", 2).attr("stroke", "blue");
            d3.selectAll(`circle:not(.${aggregator})`).attr("opacity", 0.05);
            d3.selectAll(`path:is(.Trump, .Harris)`).attr("opacity", 0.05);
        };
    }

    function removeSoloAggregator(aggregator) {
        return () => {
            d3.selectAll(`circle`).attr("opacity", 0.3).attr("r", 3).attr("stroke-width", 0);
            d3.selectAll(`path:is(.Trump, .Harris)`).attr("opacity", 0.45);
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
            {#if demLead !== null && leadHTML !== null}
                <p class="has-data">
                    Nagyjából <span
                        class="compact {demLead > 0 ? 'dem' : 'rep'}"
                        >{Math.abs((demLead * 100).toFixed(0))}%</span
                    >-os {demLead > 0 ? "demokrata" : "republikánus"} vezetésnél
                    <span class="container">{@html leadHTML}</span>
                </p>
                <p class="label">Választási iránytű</p>
                <Gauge {demLead} />
                <p class="info">
                    A demokratáknak körülbelül 2%-kal kell vezetniük ahhoz, hogy
                    az elektorok számában fej-fej mellett legyenek a
                    republikánusokkal.
                </p>
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
            <svg class="polls"></svg>
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
    #winner-gauge p:first-of-type {
        text-align: center;
        font-size: 22px;
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

    .polls {
        margin: 1rem 0;
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
    p.info {
        margin: 12px 6px;
        padding: 6px;
        border-radius: 8px;
        background-color: #f7f7f7;
    }

    span.dem.compact,
    span.rep.compact {
        padding: 0 3px;
    }

    svg {
        width: 100%;
        height: auto;
        overflow: visible;
    }
</style>
