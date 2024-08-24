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

export interface PollData {
    dailyData: DayData[];
    demLead: number | null;
}
export interface RawData {
    candidate: string
    created_time: string | null
    date: string
    fivethirtyeight: string | null
    natesilver: string | null
    nyt: string | null
    realclearpolling: string | null
}

export interface DayData {
    date: string;
    Trump: CandidateData;
    Harris: CandidateData;
}

export interface CandidateData {
    candidate: string;
    date: string;
    fivethirtyeight: number | undefined;
    realclearpolling:  number | undefined;
    natesilver: number | undefined;
    nyt:  number | undefined;
    avg: number;
}