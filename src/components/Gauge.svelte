<script lang="ts">
    import { calculateCoordinates, createPathD, percToDeg } from "../lib/chartingUtils/gaugeUtils";
    import type { GaugeProps, Segment } from "../lib/types";

    export let value: GaugeProps["value"];
    export let minValue: GaugeProps["minValue"];
    export let maxValue: GaugeProps["maxValue"];
    export let segments: GaugeProps["segments"] = [];
    export let strokeWidth: GaugeProps["strokeWidth"] = 70;
    export let tickInterval: GaugeProps["tickInterval"] = 1;
    export let majorTicks: GaugeProps["majorTicks"] = [];
    export let needleColor: GaugeProps["needleColor"] = "#666";
    export let centerColor: GaugeProps["centerColor"] = "#666";

    const margin = { top: 4, right: 16, bottom: 12, left: 16 };

    const width = 250 - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;
    const radius = Math.min(width / 2, height) - strokeWidth / 2;

    const centerX = margin.left + width / 2;
    const centerY = margin.top + height;
    const gaugeRange = maxValue - minValue;

    const segmentsPathD = segments.map((segment) => {
        const startDeg = percToDeg(segment.start, gaugeRange);
        const endDeg = percToDeg(segment.end, gaugeRange);
        return createPathD(centerX, centerY, radius, startDeg, endDeg);
    });

    const arcPathD = createPathD(
        centerX,
        centerY,
        radius + strokeWidth / 2,
        percToDeg(segments[0].start, gaugeRange),
        percToDeg(segments[segments.length - 1].end, gaugeRange),
    );

    const innerArcPathD = createPathD(
        centerX,
        centerY,
        radius - strokeWidth / 2,
        percToDeg(segments[0].start, gaugeRange),
        percToDeg(segments[segments.length - 1].end, gaugeRange),
    );

    const ticks = Array.from(
        { length: (maxValue - minValue) / tickInterval + 1 },
        (_, i) => minValue + i * tickInterval,
    );

    let angle = 0;
    $: { angle = percToDeg(value, gaugeRange); }
</script>

<svg width="100%" height="150" viewBox="0 0 250 150">
    {#each segmentsPathD as pathD, i}
        <path
            d={pathD}
            fill="none"
            stroke={segments[i].color}
            stroke-width={strokeWidth}
        />
    {/each}

    <path d={arcPathD} fill="none" stroke="#ddd" stroke-width="1" />
    <path d={innerArcPathD} fill="none" stroke="#ddd" stroke-width="1" />

    {#each ticks as tick}
        {#if majorTicks.includes(tick)}
            <text
                x={calculateCoordinates(
                    centerX,
                    centerY,
                    radius + strokeWidth / 2 + 12,
                    percToDeg(tick, gaugeRange),
                ).x}
                y={calculateCoordinates(
                    centerX,
                    centerY,
                    radius + strokeWidth / 2 + 12,
                    percToDeg(tick, gaugeRange),
                ).y}
                fill="#aaa"
                font-size="10"
                text-anchor="middle"
                dominant-baseline="mathematical"
            >
                {(tick ? "+" : "") + Math.abs(tick)}
            </text>
        {/if}
        <line
            x1={calculateCoordinates(
                centerX,
                centerY,
                radius + strokeWidth / 2 - 6,
                percToDeg(tick, gaugeRange),
            ).x}
            y1={calculateCoordinates(
                centerX,
                centerY,
                radius + strokeWidth / 2 - 6,
                percToDeg(tick, gaugeRange),
            ).y}
            x2={calculateCoordinates(
                centerX,
                centerY,
                radius + strokeWidth / 2,
                percToDeg(tick, gaugeRange),
            ).x}
            y2={calculateCoordinates(
                centerX,
                centerY,
                radius + strokeWidth / 2,
                percToDeg(tick, gaugeRange),
            ).y}
            stroke="#aaa"
            stroke-width="1"
        />
    {/each}

    <polygon
        points="{calculateCoordinates(
            centerX,
            centerY,
            radius + strokeWidth / 2,
            0,
        ).x},{calculateCoordinates(
            centerX,
            centerY,
            radius + strokeWidth / 2,
            0,
        ).y} {centerX - 6},{centerY} {centerX + 6},{centerY}"
        fill={needleColor}
        transform="rotate({angle} {centerX} {centerY})"
    />
    <circle
        cx={centerX}
        cy={centerY}
        r="8"
        fill={centerColor}
        style="transform: translate(0, 1px);"
        stroke="#fff"
        stroke-width="1px"
    />
</svg>
