<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data: { [key: string]: any; [key: string]: number }[];
    export let xKey: string = 'x';
    export let yKey: string = 'y';
    export let lineColor: string = 'black';
    export let lineWidth: number = 5;
    export let pointRadius: number = 3;
    export let xLabel: string = '';
    export let yLabel: string = '';
    export let xDomain: [any, any] | null = null;
    export let yDomain: [number, number] | null = null;
    export let title: string = '';
    export let subtitle: string = '';
    export let viewBox: { width: number, height: number } = { width: 200, height: 150 };

    let chartElement: HTMLElement;
    let width = viewBox.width;
    let height = viewBox.height;
    let margin = { top: 8, right: 6, bottom: 20, left: 6 };

    const randomId = Math.random().toString(36).substring(7);

    onMount(() => {
        drawChart();
    });

    function drawChart() {
        // Clear any existing SVG elements
        d3.select(chartElement).selectAll('*').remove();

        // Set up the SVG element and dimensions
        const svg = d3.select(chartElement)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`);

        const chartGroup = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Set up scales

        data = data.map(d => ({ ...d, [xKey]: new Date(d[xKey]) }));
        const x = d3.scaleTime()
            .domain(xDomain ? 
                xDomain.map(d => new Date(d)) :
                d3.extent(data, d => d[xKey]))
            .range([0, chartWidth]);

        data = data.filter(d => !!d[yKey]);

        const y = d3.scaleLinear()
            .domain(yDomain ? yDomain : [0, d3.max(data, d => d[yKey])])
            .range([chartHeight, 0]);

        // Draw the grid lines
        drawGridlines(chartGroup, x, y, chartWidth, chartHeight);

        // Draw the line
        const line = d3.line()
            .x(d => x(d[xKey]))
            .y(d => y(d[yKey]))
            .curve(d3.curveMonotoneX);

        // Create dem and rep masks
        const demMask = chartGroup.append('defs')
            .append('mask')
            .attr('id', 'demMask-'+randomId)
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', chartWidth)
            .attr('height', chartHeight / 2)
            .attr('fill', 'white');
        
        const repMask = chartGroup.append('defs')
            .append('mask')
            .attr('id', 'repMask-'+randomId)
            .append('rect')
            .attr('x', 0)
            .attr('y', chartHeight / 2)
            .attr('width', chartWidth)
            .attr('height', chartHeight / 2)
            .attr('fill', 'white');

        chartGroup.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', lineWidth)
            .attr('stroke-opacity', 0.6)
            .attr('d', line)
            .attr('mask', `url(#demMask-${randomId})`);

        chartGroup.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', lineWidth)
            .attr('stroke-opacity', 0.6)
            .attr('d', line)
            .attr('mask', `url(#repMask-${randomId})`);
        
        d3.selectAll('.tick text').raise()

        // Draw the points
        /* chartGroup.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d[xKey]))
            .attr('cy', d => y(d[yKey]))
            .attr('r', pointRadius)
            .attr('fill', lineColor); */


/*         // X Axis Label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(${margin.left + chartWidth / 2},${height - 10})`)
            .text(xLabel);

        // Y Axis Label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(15,${margin.top + chartHeight / 2})rotate(-90)`)
            .text(yLabel); */

        // Title
        if (title) {
            svg.append('text')
                .attr('x', margin.left + chartWidth / 2)
                .attr('y', margin.top / 2)
                .attr('text-anchor', 'middle')
                .attr('font-size', '1.5rem')
                .attr('font-weight', 'bold')
                .text(title);
        }

        // Subtitle
        if (subtitle) {
            svg.append('text')
                .attr('x', margin.left + chartWidth / 2)
                .attr('y', margin.top / 2 + 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', '1rem')
                .attr('fill', '#666')
                .text(subtitle);
        }
    }

    function drawGridlines(chartGroup, x, y, chartWidth, chartHeight) {
        // X Grid
        chartGroup.append('g')
            .attr('class', 'grid x-grid')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(
                d3.axisBottom(x)
                    .ticks(d3.timeMonth.every(1))
                    .tickSizeInner(-6)
                    .tickFormat(d => new Date(d).toLocaleDateString('hu-HU', {  month: 'short' }))
            )
            .call((g) => g.select(".domain").remove())
            .selectAll('line')
            .style('stroke', '#ccc')
            .style('stroke-opacity', 1);

        // Y Grid
        chartGroup.append('g')
            .attr('class', 'grid y-grid')
            .call(
                d3.axisLeft(y)
                    .tickValues([-0.06, -0.03, 0, 0.03, 0.06])
                    .tickSize(-chartWidth)
                    .tickFormat((d) => `${Math.abs(Math.round(d * 100))}`)
            )
            .call((g) => g.select(".domain").remove())
            .selectAll('line')
            .attr('stroke', '#ddd');

        chartGroup
            .selectAll(".y-grid")
            .selectAll("text")
            .attr("fill", "#666")
            .attr("font-size", "1rem")
            .attr("stroke", "#fff")
            .attr("stroke-width", "3px")
            .attr("paint-order", "stroke")
            .attr("dx", "1em")
            .attr("dy", "-0.3em")
        
        chartGroup
            .selectAll(".x-grid")
            .selectAll("text")
            .attr("text-anchor", "start")
            .attr("fill", "#666")
            .attr("font-size", "1rem")
            .attr("stroke", "#fff")
            .attr("stroke-width", "3px")
            .attr("paint-order", "stroke")
    }
</script>

<div bind:this={chartElement} style="width: 100%; height: 100%;"></div>

<style>
    .grid line {
        stroke: lightgrey;
        shape-rendering: crispEdges;
    }

    .grid path {
        stroke-width: 0;
    }

    text {
        font-family: Arial, sans-serif;
        fill: #333;
    }
</style>