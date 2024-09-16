export interface Segment {
    start: number;
    end: number;
    color: string;
    leadingParty: 'dem' | 'rep';
    probability: number;
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
}

export interface PollData {
    dailyData: DayData[];
    demLead: number | null;
}

export type Aggregator = '538' | 'Economist' | 'NS' | 'NYT' | 'RCP' | 'Average';

export interface RawData {
    date: string;
    aggregator: Aggregator;
    candidate: string;
    value: number;
    added_time: string | null;
}

export interface DayData {
    date: string;
    Trump: CandidateData;
    Harris: CandidateData;
}

export interface CandidateData {
    candidate: string;
    [aggregator: Aggregator]: number;
}