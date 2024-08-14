<script>
    import { onMount } from "svelte";
    import * as am5 from "@amcharts/amcharts5";
    import * as am5xy from "@amcharts/amcharts5/xy";
    import * as am5radar from "@amcharts/amcharts5/radar";
    import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

    export let demLead = 2.1;

    const colors = {
        dem: {
            main: "#00f",
            secondary: "#aaf",
        },
        rep: {
            main: "#f00",
            secondary: "#faa",
        },
    };

    let lead_color = '#aaa';
    if (demLead > 2) {
        lead_color = colors.dem.main
    } else if (demLead < -2) {
        lead_color = colors.rep.main;
    }

    let lead_bg_color = '#ddd';
    if (demLead > 2) {
        lead_bg_color = colors.dem.secondary
    } else if (demLead < -2) {
        lead_bg_color = colors.rep.secondary;
    }

    let chartdiv;

    onMount(() => {
        // Create root element
        let root = am5.Root.new(chartdiv);

        // Set themes
        root.setThemes([am5themes_Animated.new(root)]);

        // Create chart
        let chart = root.container.children.push(
            am5radar.RadarChart.new(root, {
                panX: false,
                panY: false,
                startAngle: 160,
                endAngle: 380,
                innerRadius: -20,
            }),
        );

        let gradientFill = am5.LinearGradient.new(root, {
            rotation: 0,
            stops: [
                { color: am5.color(colors.rep.main), offset: 0 },
                { color: am5.color('#eee'), offset: 0.5000 },
                { color: am5.color('#eee'), offset: 0.7617
                 },
                { color: am5.color(colors.dem.main), offset: 1 },
            ],
        });

        // Create axis and its renderer
        let axisRenderer = am5radar.AxisRendererCircular.new(root, {
            strokeWidth: 30,
            strokeOpacity: 1,
            strokeGradient: gradientFill,
        });

        let xAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(root, {
                maxDeviation: 0,
                min: -15,
                max: 15,
                strictMinMax: true,
                renderer: axisRenderer,
            }),
        );

        // Add clock hand
        let axisDataItem = xAxis.makeDataItem({});

        let clockHand = am5radar.ClockHand.new(root, {
            pinRadius: am5.percent(45),
            radius: am5.percent(60),
            bottomWidth: 60,
            pinFill: am5.color(lead_bg_color),
        });

        clockHand.pin.adapters.add("fill", () => am5.color(lead_bg_color));
        clockHand.hand.adapters.add("fill", () => am5.color(lead_bg_color));

        let bullet = axisDataItem.set(
            "bullet",
            am5xy.AxisBullet.new(root, {
                sprite: clockHand,
            }),
        );

        xAxis.createAxisRange(axisDataItem);

        let label = chart.radarContainer.children.push(
            am5.Label.new(root, {
                fill: am5.color(lead_color),
                centerX: am5.percent(50),
                textAlign: "center",
                centerY: am5.percent(50),
                fontSize: "1.5rem",
                fontFamily: "Courier",
            }),
        );

        // Set the initial value based on the prop
        axisDataItem.set("value", demLead);
        bullet.get("sprite").on("rotation", function () {
            let value = axisDataItem.get("value");
            label.set("text", Math.abs(value).toFixed(1).toString().replace(".", ","));
        });

        chart.appear(1000, 100);

        return () => {
            root.dispose();
        };
    });
</script>

<!-- HTML structure -->
<div bind:this={chartdiv} style="width: 100%; height: 200px"></div>

<style>
    :global(.chartdiv) {
        width: 100%;
        height: 200px;
    }

    :global(.am5-layer-30) {
        display: none;
    }
</style>
