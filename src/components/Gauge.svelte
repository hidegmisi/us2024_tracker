<script>
    import { onMount } from "svelte";
    import * as am5 from "@amcharts/amcharts5";
    import * as am5xy from "@amcharts/amcharts5/xy";
    import * as am5radar from "@amcharts/amcharts5/radar";
    import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

    export let demLead = 2.1;

    let lead_color = '#aaa';
    if (demLead > 2) {
        lead_color = '#00f';
    } else if (demLead < -2) {
        lead_color = '#f00';
    }

    let lead_bg_color = '#ddd';
    if (demLead > 2) {
        lead_bg_color = '#aaf';
    } else if (demLead < -2) {
        lead_bg_color = '#faa';
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

        // Create axis and its renderer
        let axisRenderer = am5radar.AxisRendererCircular.new(root, {
            innerRadius: -40,
        });

        axisRenderer.grid.template.setAll({
            stroke: root.interfaceColors.get("background"),
            visible: true,
            strokeOpacity: 0.8,
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
            label.set("text", Math.abs(value).toFixed(1).toString());
        });

        // Create axis ranges bands
        let bandsData = [
            {
                title: "Reps Lead",
                color: "#f00",
                lowScore: -15,
                highScore: 0,
            },
            {
                title: "Close",
                color: "#ddd",
                lowScore: 0,
                highScore: 4,
            },
            {
                title: "Dems Lead",
                color: "#00f",
                lowScore: 4,
                highScore: 15,
            },
        ];

        am5.array.each(bandsData, function (data) {
            let axisRange = xAxis.createAxisRange(xAxis.makeDataItem({}));

            axisRange.setAll({
                value: data.lowScore,
                endValue: data.highScore,
            });

            axisRange.get("axisFill").setAll({
                visible: true,
                fill: am5.color(data.color),
                fillOpacity: 0.8,
            });
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
</style>
