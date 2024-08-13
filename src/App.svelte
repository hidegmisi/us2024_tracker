<script>
    import * as d3 from "d3";

    export let repo = "hidegmisi/us2024_aggregator_scraper";
    let data = [];
    let parsedData = [];
    let svg;
    let colors = {
        Trump: "red",
        Harris: "blue",
    };

    async function fetchData() {
        const response = await fetch(
            `https://api.github.com/repos/${repo}/contents/polls.csv`,
        );
        const json = await response.json();

        const csvData = atob(json.content);
        data = d3.csvParse(csvData);

        const pollsters = [
            "fivethirtyeight",
            "natesilverdate",
            "nyt",
            "realclearpolling",
        ];

        for (let item of data) {
            for (let pollster of pollsters) {
                if (item[pollster] === "") {
                    item[pollster] = null;
                }
                if (item[pollster]) {
                    item[pollster] = Number(
                        item[pollster].replace("%", "") / 100,
                    );
                }
            }
        }

        parsedData = data.map((d) => ({
            candidate: d.candidate,
            date: d3.timeParse("%Y-%m-%d")(d.date),
            value: d3.mean(pollsters.map((p) => d[p])),
        }));

        console.log(parsedData);

        drawChart();
    }

    function drawChart() {
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        svg = d3
            .select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const parseDate = d3.timeParse("%Y-%m-%d");
        data.forEach((d) => {
            d.date = parseDate(d.date);
        });

        const x = d3
            .scaleTime()
            .domain(d3.extent(data, (d) => d.date))
            .range([0, width]);

        const y = d3.scaleLinear().domain([0.4, 0.5]).range([height, 0]);

        // Average lines
        // Calculate the average for each candidate by date
        const averagesByCandidate = d3
            .rollups(
                data,
                (v) =>
                    d3.mean(v, (d) =>
                        d3.mean([
                            d.fivethirtyeight,
                            d.realclearpolling,
                            d.nyt,
                            d.natesilverdate,
                        ]),
                    ),
                (d) => d.candidate,
                (d) => d.date,
            )
            .map(([candidate, dates]) => ({
                candidate: candidate,
                values: dates.map(([date, avg]) => ({ date, avg })),
            }));

        console.log(averagesByCandidate);

        // Draw the average line for each candidate
        averagesByCandidate.forEach(({ candidate, values }) => {
            const line = d3
                .line()
                .x((d) => x(d.date))
                .y((d) => y(d.avg));

            svg.append("path")
                .datum(values)
                .attr("fill", "none")
                .attr("stroke", colors[candidate])
                .attr("stroke-width", 2)
                .attr("d", line);
        });

        // Draw individual dots for each candidate and poll
        data.forEach((d) => {
            const yValues = [
                d.fivethirtyeight,
                d.realclearpolling,
                d.nyt,
                d.natesilverdate,
            ].filter((v) => v !== null);

            yValues.forEach((value) => {
                svg.append("circle")
                    .attr("cx", x(d.date))
                    .attr("cy", y(value))
                    .attr("r", 4)
                    .attr("fill", colors[d.candidate])
                    .attr("stroke", "white")
                    .attr("stroke-width", 1.5)
                    .attr("opacity", 0.7);
            });
        });

        // Add X gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", `translate(0,${height})`)
            .call(
                d3
                    .axisBottom(x)
                    .ticks(d3.timeWeek.every(1)) // Adjust the tick frequency
                    .tickSize(-height)
                    .tickFormat(""),
            )
            .selectAll("line")
            .style("stroke", "#d3d3d3") // Light grey for grid lines
            .style("stroke-opacity", 1);

        // Add Y gridlines
        svg.append("g")
            .attr("class", "grid")
            .call(
                d3
                    .axisLeft(y)
                    .ticks(5) // Adjust the number of ticks
                    .tickSize(-width)
                    .tickFormat((d) => d + "%"),
            ) // Add percentage sign to the labels
            .selectAll("line")
            .style("stroke", "#d3d3d3") // Light grey for grid lines
            .style("stroke-opacity", 1);

        // Style for axis
        svg.selectAll(".axis path, .axis line").style("stroke", "none");

        // Customize tick labels (for x-axis)
        svg.selectAll(".tick text")
            .attr("dy", "1.5em") // Adjust the vertical position
            .attr("dx", "1em") // Adjust the horizontal position
            .style("font-size", "12px")
            .style("fill", "#666");

        // Customize y-axis tick labels
        svg.selectAll(".axis-left .tick text")
            .style("font-size", "12px")
            .style("fill", "#666")
            .style("text-anchor", "end"); // Align to the end

        // Remove the baseline
        svg.select(".domain").remove();
    }

    fetchData();
</script>

<div>
    <h1>Polling Data Visualization</h1>
    <svg></svg>
</div>

<style>
    #chart {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 14px;
    }

    .axis path,
    .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
    }

    .tick text {
        font-size: 12px;
    }

    .grid .tick line {
        stroke: lightgrey;
        opacity: 0.7;
    }

    .grid path {
        stroke-width: 0;
    }
</style>
