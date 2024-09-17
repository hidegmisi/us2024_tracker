import * as d3 from "d3";
import type { DayData } from "../types";

export function drawEventsChart(dailyData: DayData[]) {
    const { margin, width, height, x, y, chartGroup, chartElements } = setupChart(dailyData);

    drawGridlines(chartGroup, chartElements, x, y, width, height);
    drawLines(chartGroup, chartElements, dailyData, x, y);
    addCampaignEvents(chartGroup, dailyData, x, y, [
        {
            date: '2024-07-13',
            id: 'trump-shot-1',
            label: 'Trumpot meglövik egy kampányrendezvényen',
            opacity: 0.3,
            labelColor: '#f00',
            width: 1.5,
            type: 'dotted',
        },
        {
            date: '2024-07-21',
            id: 'biden-out',
            label: 'Biden visszalép, Harris elindul',
            opacity: 0.3,
            labelColor: '#00f',
            width: 1.5,
            type: 'dotted',
        },
        {
            date: '2024-08-05',
            id: 'harris-nomination',
            label: 'Harris<br>jelölése',
            opacity: 0.3,
            labelColor: '#00f',
            width: 1.5,
            type: 'dotted',
        },
        {
            date: '2024-08-23',
            id: 'kennedy-out',
            label: 'Kennedy<br>visszalép',
            opacity: 0.3,
            labelColor: '#888',
            width: 1.5,
            type: 'dotted',
        },
        {
            date: '2024-09-10',
            id: 'debate-1',
            label: 'Elnökjelölti<br>vita',
            opacity: 0.3,
            labelColor: '#888',
            width: 1.5,
            type: 'dotted',
        },
    ]);
    chartElements.raise();
    d3.select(".events").raise();
    /* drawDots(chartGroup, chartElements, dailyData, x, y, aggregators, screenSizeCateg);
    setupInteractivity(chartGroup, chartElements, dailyData, x, y, width, height, screenSizeCateg); */
}

function setupChart(dailyData: DayData[]) {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const svg = d3.select(".campaignEvents");

    const width = parseInt(svg.style("width")) - margin.left - margin.right;
    const height = width * (5 / 1);

    console.log(dailyData);

    const dateExtent = d3.extent(dailyData, (d) =>
        d3.timeParse("%Y-%m-%d")(d.date)
    ) as [Date, Date];

    const paddedStartDate = new Date("2024-07-11");
    /* paddedStartDate.setDate(paddedStartDate.getDate() - 7); */

    const x = d3.scaleLinear().domain([-0.05, 0.05]).range([0, width]);

    const y = d3
        .scaleTime()
        .domain([paddedStartDate, dateExtent[1]])
        .range([0, height]);

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

function drawGridlines(
    chartGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>, 
    chartElements: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    x: d3.ScaleLinear<number, number, never>,
    y: d3.ScaleTime<number, number, never>,
    width: number,
    height: number,
) {
    chartGroup
        .append("g")
        .attr("class", "grid x-grid")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3
                .axisBottom(x)
                .tickValues(d3.range(x.domain()[0] + 0.01, x.domain()[1], 0.01))
                .tickSize(-height)
                .tickPadding(6)
                .tickFormat(d => '+' + Math.abs(d * 100).toPrecision(1))
        )
        .call((g) => g.select(".domain").remove())
        .selectAll("line")
        .style("stroke", "#eee")
        .style("stroke-opacity", 1);

    chartGroup
        .append("g")
        .attr("class", "grid y-grid y-grid-left")
        .call(
            d3
                .axisLeft(y)
                .tickValues(d3.timeDay.range(y.domain()[0], y.domain()[1], 7))
                .tickSize(-width)
                .tickFormat(d => new Date(d).toLocaleDateString('hu-HU', {month: 'short', day: 'numeric'}) + '\n' + 'vezetés')
        )
        .call((g) => g.select(".domain").remove())
        .selectAll("line")
        .style("stroke", "#ccc")
        .style("stroke-opacity", 1);
}

function drawLines(
    chartGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>, 
    chartElements: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    dailyData: DayData[],
    x: d3.ScaleLinear<number, number, never>,
    y: d3.ScaleTime<number, number, never>,
) {
    const line = d3
        .line<DayData>()
        .x((d) => x(parseFloat(d.Trump.avg) - parseFloat(d.Harris.avg)))
        .y((d) => y(d3.timeParse("%Y-%m-%d")(d.date)))

    chartElements
        .append("path")
        .datum(dailyData)
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", 10);
    
    chartElements
        .selectAll(".line")
        .transition()
        .duration(500)
        .attr("d", line);

    chartElements

}

function addCampaignEvents(
    chartGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>, 
    dailyData: DayData[],
    x: d3.ScaleLinear<number, number, never>,
    y: d3.ScaleTime<number, number, never>,
    events: { date: string, id: string, label: string, opacity: number, labelColor: string, width: number, type: string }[]
) {
    const eventGroup = chartGroup
        .append("g")
        .attr("class", "events");

    events.forEach((event) => {
        const eventDate = d3.timeParse("%Y-%m-%d")(event.date);
        const xValue = x(0);
        const yValue = y(eventDate);

        eventGroup
            .append("circle")
            .attr("class", "event-circle")
            .attr("id", event.id)
            .attr("cx", xValue)
            .attr("cy", yValue)
            .attr("r", 10)
            .style("fill", event.labelColor)
            .style("opacity", event.opacity);

        eventGroup
            .append("text")
            .attr("class", "event-label")
            .attr("id", event.id)
            .attr("x", xValue)
            .attr("y", yValue)
            .attr("dy", "-1em")
            .style("fill", "#333")
            .style("font-size", "0.8em")
            .style("text-anchor", "middle")
            .text(event.label);
    });
}