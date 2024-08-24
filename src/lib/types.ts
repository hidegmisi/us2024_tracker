export interface Segment {
    start: number;
    end: number;
    color: string;
    label?: string;
}

export interface GaugeProps {
    value: number;
    minValue: number;
    maxValue: number;
    segments: Segment[];
    strokeWidth?: number;
    radius?: number;
    tickInterval?: number;
    majorTicks?: number[];
    needleColor?: string;
    centerColor?: string;
    labelFormatter?: (value: number) => string;
    showLabels?: boolean;
    animation?: boolean;
}

