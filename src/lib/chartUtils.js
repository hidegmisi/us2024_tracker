import * as d3 from "d3";

export const colors = {
    Trump: "red",
    Harris: "blue",
};

let resizeDebounce = null;

let screenSizes = {
    mobile: 500,
    small: 700,
};

let paddingSizes = {
    mobile: 100,
    small: 120,
    large: 150,
};

let candidateLabelSizes = {
    mobile: 1,
    small: 1.2,
    large: 1.5,
}

let dotSizes = {
    mobile: 2,
    small: 3,
    large: 3,
}

let lineWidths = {
    mobile: 5,
    small: 7,
    large: 9,
}

let gridLabelSizes = {
    mobile: 0.65,
    small: 0.8,
    large: 0.9,
}

function getScreenSize() {
    const width = window.innerWidth;
    for (const [size, minWidth] of Object.entries(screenSizes)) {
        if (width < minWidth) {
            return size;
        }
    }
    return "large";
}

export function onResize(dailyAggData, dailyData, aggregators) {
    if (resizeDebounce) {
        clearTimeout(resizeDebounce);
    }
    
    resizeDebounce = setTimeout(() => {
        d3.selectAll(".polls").selectAll("*").remove();
        drawChart(dailyAggData, dailyData, aggregators);
    }, 250);
}

export function drawChart(dailyAggData, dailyData, aggregators) {
    const screenSizeCateg = getScreenSize();
    const { margin, width, height, x, y, chartGroup, chartElements } = setupChart(dailyData, screenSizeCateg);

    drawLines(chartGroup, chartElements, dailyAggData, x, y, screenSizeCateg);
    drawDots(chartGroup, chartElements, dailyData, x, y, aggregators, screenSizeCateg);
    drawGridlines(chartGroup, chartElements, x, y, width, height, screenSizeCateg);
    setupInteractivity(chartGroup, chartElements, dailyData, x, y, width, height, screenSizeCateg);
}

function setupChart(dailyData, screenSizeCateg) {
    const paddingRightSize = paddingSizes[screenSizeCateg];

    const margin = { top: 20, right: 0, bottom: 30, left: 0 };
    const svg = d3.select(".polls");

    const width = parseInt(svg.style("width")) - margin.left - margin.right;
    const height = width * (4 / 7);

    const dateExtent = d3.extent(dailyData, (d) =>
        d3.timeParse("%Y-%m-%d")(d.Trump.date)
    );

    const paddedStartDate = new Date(dateExtent[0]);
    paddedStartDate.setDate(paddedStartDate.getDate() - 1);

    const x = d3
        .scaleTime()
        .domain([paddedStartDate, dateExtent[1]])
        .range([0, width - paddingRightSize]);

    const y = d3.scaleLinear().domain([0.35, 0.51]).range([height, 0]);

    const chartGroup = svg
        .attr(
            "viewBox",
            `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    const chartElements = chartGroup
        .append("g")
        .attr("class", "chart-elements");

    return { margin, width, height, x, y, chartGroup, chartElements };
}

function drawLines(chartGroup, chartElements, dailyAggData, x, y, screenSizeCateg) {
    for (const candidate of ["Trump", "Harris"]) {
        const line = d3
            .line()
            .x((d) => x(d.date))
            .y((d) => y(d.avg))
            .curve(d3.curveMonotoneX);

        chartElements
            .append("path")
            .datum(
                dailyAggData.map((d) => ({
                    date: d3.timeParse("%Y-%m-%d")(d.date),
                    avg: d[candidate],
                }))
            )
            .attr("class", candidate)
            .attr("fill", "none")
            .attr("stroke", colors[candidate])
            .attr("stroke-width", lineWidths[screenSizeCateg])
            .attr("opacity", 0.425)
            .attr("d", line);

        chartGroup
            .append("path")
            .datum(
                dailyAggData.map((d) => ({
                    date: d3.timeParse("%Y-%m-%d")(d.date),
                    avg: d[candidate],
                }))
            )
            .attr("class", candidate)
            .attr("class", "background-line")
            .attr("fill", "none")
            .attr("stroke", colors[candidate])
            .attr("stroke-width", lineWidths[screenSizeCateg])
            .attr("opacity", 0.05)
            .attr("d", line);
    }
}

function drawDots(chartGroup, chartElements, dailyData, x, y, aggregators, screenSizeCateg) {
    const circleGroup = chartElements.append("g");
    const backgroundCircleGroup = chartGroup.append("g");

    dailyData.forEach((d) => {
        for (const candidate of ["Trump", "Harris"]) {
            aggregators.forEach((aggregator) => {
                if (!d[candidate][aggregator]) return;

                circleGroup
                    .append("circle")
                    .attr("class", aggregator + " " + candidate)
                    .attr(
                        "cx",
                        x(d3.timeParse("%Y-%m-%d")(d[candidate].date))
                    )
                    .attr("cy", y(d[candidate][aggregator]))
                    .attr("r", dotSizes[screenSizeCateg])
                    .attr("fill", colors[candidate])
                    .attr("opacity", 0.2)
                    .attr("stroke", "white")
                    .attr("stroke-width", 0)
                    .attr("paint-order", "stroke");
                
                backgroundCircleGroup
                    .append("circle")
                    .attr("class", aggregator + " " + candidate)
                    .attr("class", "background-dot")
                    .attr(
                        "cx",
                        x(d3.timeParse("%Y-%m-%d")(d[candidate].date))
                    )
                    .attr("cy", y(d[candidate][aggregator]))
                    .attr("r", dotSizes[screenSizeCateg])
                    .attr("fill", colors[candidate])
                    .attr("opacity", 0.1)
                    .attr("stroke", "white")
                    .attr("stroke-width", 0)
                    .attr("paint-order", "stroke");
            });
        }
    });
}

function drawGridlines(chartGroup, chartElements, x, y, width, height, screenSizeCateg) {
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
                    })
                )
        )
        .call((g) => g.select(".domain").remove())
        .selectAll("line")
        .style("stroke", "#ccc")
        .style("stroke-opacity", 1);

    chartGroup
        .append("g")
        .attr("class", "grid y-grid y-grid-left")
        .call(
            d3
                .axisLeft(y)
                .tickValues([0.35, 0.4, 0.45, 0.5])
                .tickSize(-(width - paddingSizes[screenSizeCateg]))
                .tickFormat((d) => `${d * 100}`)
        )
        .call((g) => g.select(".domain").remove())
        .selectAll("line")
        .style("stroke", "#ddd")
        .style("stroke-opacity", 1);

    chartGroup
        .append("g")
        .attr("class", "grid y-grid-right")
        .call(
            d3
                .axisRight(y)
                .tickValues([0.35, 0.4, 0.45, 0.5])
                .tickSize(-paddingSizes[screenSizeCateg]) // Adjusted for the padding
                .tickFormat("")
        )
        .call((g) => g.select(".domain").remove())
        .selectAll("line")
        .attr("class", "y-gridline-right")
        .style("stroke", "#f7f7f7")
        .attr("transform", `translate(${width}, 0)`);

    chartGroup
        .selectAll(".y-grid-right")
        .selectAll("text")
        .remove();

    chartGroup
        .selectAll(".y-grid")
        .selectAll("text")
        .attr("dx", "1.5em")
        .attr("dy", "-0.5em")

    d3.selectAll(".grid text").attr("font-size", `${gridLabelSizes[screenSizeCateg]}rem`).attr("fill", "#666");
}

function setupInteractivity(chartGroup, chartElements, dailyData, x, y, width, height, screenSizeCateg) {
    const paddingRightSize = paddingSizes[screenSizeCateg];

    const focusDate = chartGroup
        .append("g")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("x1", width - (paddingRightSize + 1))
        .attr("x2", width - (paddingRightSize + 1));

    const verticalLine = focusDate
        .append("line")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("x1", width - (paddingRightSize + 1))
        .attr("x2", width - (paddingRightSize + 1));

    const dateLabel = focusDate
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", `${gridLabelSizes[screenSizeCateg]}rem`)
        .text(
            new Date().toLocaleDateString("hu-HU", {
                month: "long",
                day: "numeric",
            }),
        );

    chartGroup.append("defs")
        .append("clipPath")
        .attr("id", "overlay-clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width - paddingRightSize)
        .attr("height", height);

    chartElements.attr("clip-path", "url(#overlay-clip)");

    dateLabel.attr("x", width - paddingRightSize).attr("y", -6);

    const focusTexts = initializeFocusTexts(chartGroup, colors, screenSizeCateg);
    updateLabels(focusTexts, dailyData, x, y);

    const svg = d3.select(chartGroup.node().parentNode);

    svg.append("rect")
        .attr("width", width - paddingRightSize)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
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
                .attr("x1", width - (paddingRightSize + 1))
                .attr("x2", width - (paddingRightSize + 1));

            dateLabel
                .text(
                    new Date().toLocaleDateString("hu-HU", {
                        month: "long",
                        day: "numeric",
                    }),
                )
                .attr("x", width - (paddingRightSize + 1))
                .attr("y", -6);

            updateLabels(focusTexts, dailyData, x, y);
            d3.select("#overlay-clip rect")
                .attr("width", width - paddingRightSize);

            chartGroup.selectAll(".y-grid-left line")
                .attr("x2", (width - paddingRightSize));
            chartGroup.selectAll(".y-grid-right line")
                .attr("x1", 0)
                .attr("x2", -paddingSizes[screenSizeCateg]);
            
            Object.values(focusTexts).forEach((text) => text.raise());
        });
}

function initializeFocusTexts(chartGroup, colors, screenSizeCateg) {
    const focusTexts = {};
    Object.keys(colors).forEach((candidate) => {
        focusTexts[candidate] = chartGroup
            .append("text")
            .attr("class", candidate)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle")
            .style("font-size", `${candidateLabelSizes[screenSizeCateg]}rem`)
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
    const lineXPosition = x(lineDate);

    verticalLine.attr("x1", x(lineDate) - 1).attr("x2", x(lineDate));
    dateLabel
        .text(
            roundedDate.toLocaleDateString("hu-HU", {
                month: "long",
                day: "numeric",
            }),
        )
        .attr("x", x(lineDate));

    d3.select("#overlay-clip rect")
        .attr("x", 0)
        .attr("width", x(lineDate));

    // Adjust the gridlines' positions to match the date marker
    chartGroup.selectAll(".y-grid-left line")
        .attr("x2", lineXPosition);

    chartGroup.selectAll(".y-grid-right line")
        .attr("x1", 0)
        .attr("x2", -(width - lineXPosition));

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
                        `${(closestValue[candidate].avg * 100).toFixed(1).replace(".", ",")}`,
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