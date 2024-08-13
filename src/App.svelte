<script>
    import * as d3 from "d3";

    export let repo = "hidegmisi/us2024_aggregator_scraper";

    const colors = {
        Trump: "red",
        Harris: "blue",
    };

    async function fetchPollData(repo) {
        const response = await fetch(`https://api.github.com/repos/${repo}/contents/polls.csv`);
        const json = await response.json();
        const csvData = atob(json.content);
        return d3.csvParse(csvData);
    }

    function isDataStale() {
        const oneHour = 1000 * 60 * 60;
        const now = new Date();
        const lastUpdated = new Date(sessionStorage.getItem("pollsDataUpdated"));
        const diff = now - lastUpdated;

        return sessionStorage.getItem("pollsData") == null || sessionStorage.getItem("pollsDataUpdated") == null || diff >= oneHour;
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
        const pollsters = ["fivethirtyeight", "natesilver", "nyt", "realclearpolling"];
        data.forEach((d) => {
            pollsters.forEach((p) => {
                d[p] = d[p] || null;
            });
        });

        return data.map((d) => ({
            candidate: d.candidate,
            date: d3.timeParse("%Y-%m-%d")(d.date),
            value: d3.mean(pollsters.map((p) => d[p])),
        }));
    }

    async function fetchData() {
        try {
            const data = await getPollData(repo);
            const parsedData = prepareData(data);
            drawChart(parsedData, data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function calculateAveragesByCandidate(rawData) {
        return d3.rollups(
            rawData,
            (v) =>
                d3.mean(v, (d) =>
                    d3.mean([d.fivethirtyeight, d.realclearpolling, d.nyt, d.natesilver])
                ),
            (d) => d.candidate,
            (d) => d3.timeParse("%Y-%m-%d")(d.date)
        ).map(([candidate, dates]) => ({
            candidate,
            values: dates.map(([date, avg]) => ({ date, avg })),
        }));
    }

    function drawChart(parsedData, rawData) {
        const { margin, width, height, x, y, chartGroup } = setupChart(rawData);
        const averagesByCandidate = calculateAveragesByCandidate(rawData);

        drawLines(chartGroup, averagesByCandidate, x, y);
        drawDots(chartGroup, rawData, x, y);
        drawGridlines(chartGroup, x, y, width, height);
        setupInteractivity(chartGroup, averagesByCandidate, x, y, width, height);
    }

    function setupChart(rawData) {
        const margin = { top: 20, right: 0, bottom: 30, left: 0 };
        const svg = d3.select("svg");
        const width = parseInt(svg.style("width")) - margin.left - margin.right;
        const height = width * (2 / 3);

        const x = d3
            .scaleTime()
            .domain(d3.extent(rawData, (d) => d3.timeParse("%Y-%m-%d")(d.date)))
            .range([0, width - 100]);

        const y = d3.scaleLinear().domain([0.35, 0.50]).range([height, 0]);

        const chartGroup = svg
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        return { margin, width, height, x, y, chartGroup };
    }

    function drawLines(chartGroup, averagesByCandidate, x, y) {
        averagesByCandidate.forEach(({ candidate, values }) => {
            const line = d3
                .line()
                .x((d) => x(d.date))
                .y((d) => y(d.avg))
                .curve(d3.curveMonotoneX);

            chartGroup
                .append("path")
                .datum(values)
                .attr("class", candidate)
                .attr("fill", "none")
                .attr("stroke", colors[candidate])
                .attr("stroke-width", 3)
                .attr("d", line);
        });
    }

    function drawDots(chartGroup, rawData, x, y) {
        const circleGroup = chartGroup.append("g");

        rawData.forEach((d) => {
            const yValues = [d.fivethirtyeight, d.realclearpolling, d.nyt, d.natesilver].filter((v) => v !== null);
            yValues.forEach((value) => {
                circleGroup
                    .append("circle")
                    .attr("cx", x(d3.timeParse("%Y-%m-%d")(d.date)))
                    .attr("cy", y(value))
                    .attr("r", 4)
                    .attr("fill", colors[d.candidate])
                    .attr("stroke", "white")
                    .attr("stroke-width", 1.5)
                    .attr("opacity", 0.3);
            });
        });
    }

    function drawGridlines(chartGroup, x, y, width, height) {
        chartGroup
            .append("g")
            .attr("class", "grid x-grid")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(x)
                    .ticks(d3.timeWeek.every(1))
                    .tickSize(-height)
                    .tickFormat(d3.timeFormat("%m/%d"))
            )
            .call((g) => g.select(".domain").remove())
            .call((g) => g.selectAll(".tick line").remove())
            .selectAll("line")
            .style("stroke", "#eee")
            .style("stroke-opacity", 1);

        chartGroup
            .selectAll(".x-grid")
            .selectAll("text")
            .attr("dy", "1em")

        chartGroup
            .append("g")
            .attr("class", "grid y-grid")
            .call(
                d3.axisLeft(y)
                    .ticks(3)
                    .tickSize(-width)
                    .tickFormat((d) => `${d * 100}%`)
            )
            .selectAll("line")
            .style("stroke", "#bbb")
            .style("stroke-opacity", 1);

        chartGroup
            .selectAll(".y-grid")
            .selectAll("text")
            .attr("dx", "2.5em")
            .attr("dy", "-0.5em")

        chartGroup
            .selectAll(".grid")
            .selectAll("text")
            .style("font-size", "1rem");
    }

    function setupInteractivity(chartGroup, averagesByCandidate, x, y, width, height) {
        const verticalLine = chartGroup
            .append("line")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("y1", 0)
            .attr("y2", height)
            .attr("x1", width - 100)
            .attr("x2", width - 100);

        const focusTexts = initializeFocusTexts(chartGroup, colors);
        updateLabels(focusTexts, averagesByCandidate, x, y);

        const svg = d3.select(chartGroup.node().parentNode);

        svg
            .append("rect")
            .attr("width", width - 100)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", () => {
                Object.values(focusTexts).forEach((text) => text.style("opacity", 1));
            })
            .on("mousemove", function (event) {
                handleMouseMove(event, chartGroup, averagesByCandidate, x, y, width, height, verticalLine, focusTexts);
            })
            .on("mouseout", () => {
                verticalLine
                    .attr("y1", 0)
                    .attr("y2", height)
                    .attr("x1", width - 100)
                    .attr("x2", width - 100);

                updateLabels(focusTexts, averagesByCandidate, x, y);
                
                chartGroup.selectAll(".overlay-box").remove(); // Clear the white box on mouse out
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
                .style("stroke", '#fff')
                .style("stroke-width", 2)
                .attr("paint-order", "stroke");
        });
        return focusTexts;
    }

    function handleMouseMove(event, chartGroup, averagesByCandidate, x, y, width, height, verticalLine, focusTexts) {
        const mouse = d3.pointer(event);
        const mouseDate = x.invert(mouse[0]);
        const roundedDate = new Date(mouseDate);
        roundedDate.setHours(0, 0, 0, 0);
        if (mouseDate.getHours() >= 12) {
            roundedDate.setDate(roundedDate.getDate() + 1);
        }
        const lineDate = new Date(roundedDate.getTime() - 86400000); // Subtract 1 day from the date
        verticalLine.attr("x1", x(lineDate) - 1).attr("x2", x(lineDate));

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

        updateLabels(focusTexts, averagesByCandidate, x, y, lineDate);
        fixLabelPositions(focusTexts, x, y, width, height);
    }

    function updateLabels(focusTexts, averagesByCandidate, x, y, lineDate = null) {
        if (!lineDate) {
            lineDate = d3.max(averagesByCandidate[0].values, (d) => d.date);
        }

        // Find the closest data point for each candidate
        averagesByCandidate.forEach(({ candidate, values }) => {
            let closestValue = values[0];
            let minDiff = Math.abs(lineDate - values[0].date);

            values.forEach((v) => {
                const diff = Math.abs(lineDate - v.date);
                if (diff < minDiff) {
                    closestValue = v;
                    minDiff = diff;
                }
            });

            // Update focus text
            if (closestValue) {
                focusTexts[candidate]
                    .text(`${candidate}: `)
                    .attr("x", x(closestValue.date) + 7)
                    .attr("y", y(closestValue.avg))
                    .append("tspan")
                    .text(`${(closestValue.avg * 100).toFixed(1)}%`)
                    .attr("style", `fill: ${colors[candidate]}; font-weight: 900; font-size: 1.2rem; dominant-baseline: middle;`)
            } else {
                focusTexts[candidate].text(""); // Clear the label if no data
            }
        });
    }

    function fixLabelPositions(focusTexts, x, y, width, height) {
        const y_positions = Object.values(focusTexts).map((text) => parseFloat(text.attr("y")));
        const difference = Math.abs(y_positions[0] - y_positions[1])
        const average_y = (y_positions[0] + y_positions[1]) / 2;
        console.log(difference);
        
        if (difference < 30) {
            const topCandidate = y_positions[0] > y_positions[1] ? "Trump" : "Harris";
            const bottomCandidate = y_positions[0] > y_positions[1] ? "Harris" : "Trump";
            
            focusTexts[topCandidate].attr("y", average_y + 15);
            focusTexts[bottomCandidate].attr("y", average_y - 15);
        }
        
    }

    fetchData();
</script>

<article>
    <h1>Hogy áll az amerikai elnökválasztás?</h1>
    <svg></svg>
</article>

<style>
    article {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 8px 16px;
    }

    h1 {
        font-size: 1.5rem;
        margin-bottom: 16px;
    }

    svg {
        width: 100%;
        height: auto;
        overflow: visible;
    }
</style>