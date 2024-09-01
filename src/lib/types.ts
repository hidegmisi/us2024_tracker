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
export interface RawData {
    candidate: string
    created_time: string | null
    date: string
    fivethirtyeight: string | null
    natesilver: string | null
    nyt: string | null
    realclearpolling: string | null
    economist: string | null
}

export interface DayData {
    date: string;
    Trump: CandidateData;
    Harris: CandidateData;
}

export interface CandidateData {
    candidate: string;
    fivethirtyeight: number | undefined;
    realclearpolling:  number | undefined;
    natesilver: number | undefined;
    nyt:  number | undefined;
    economist: number | undefined;
    avg: number;
}