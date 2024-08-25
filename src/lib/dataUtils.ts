import * as d3 from "d3";
import type { CandidateData, DayData, RawData } from "./types";

const aggregators = [
    "fivethirtyeight",
    "realclearpolling",
    "natesilver",
    "nyt",
    "economist",
];

async function fetchPollData(repo: string): Promise<RawData[]> {
    const response = await fetch(
        `https://api.github.com/repos/${repo}/contents/polls.csv`,
    );
    const json = await response.json();
    const csvData = atob(json.content);
    return d3.csvParse(csvData) as unknown as RawData[];
}

function isDataStale() {
    const oneHour = 1000 * 60 * 60;
    const now = new Date();
    const lastUpdated = new Date(sessionStorage.getItem("pollsDataUpdated") || 0);
    const diff = now.getTime() - lastUpdated.getTime();

    return (
        sessionStorage.getItem("pollsData") == null ||
        sessionStorage.getItem("pollsDataUpdated") == null ||
        diff >= oneHour
    );
}

async function getPollData(repo: string): Promise<RawData[] | false> {
    if (isDataStale()) {
        const pollData = await fetchPollData(repo);
        const now = new Date();
        sessionStorage.setItem("pollsData", JSON.stringify(pollData));
        sessionStorage.setItem("pollsDataUpdated", now.toString());
        return pollData;
    } else {
        const storedData = sessionStorage.getItem("pollsData");
        if (storedData === null) return false;
        return JSON.parse(storedData) as RawData[];
    }
}

function prepareData(data: RawData[]): DayData[] {
    const candidates = ["Trump", "Harris"];

    data.forEach((d) => {
        aggregators.forEach((p) => {
            d[p] = d[p] || null;
        });
    });

    const dates = Array.from(new Set(data.map((d) => d.date)));

    const dailyCandidateData = dates.map((date) => {
        const dateData = data.filter((d) => d.date === date);
        const candidateData = candidates.map((candidate) => {
            const candidatePolls = dateData.filter(
                (d) => d.candidate === candidate,
            );
            const aggregatorData = Object.fromEntries(
                aggregators.map((aggregator) => [
                    aggregator,
                    d3.mean(candidatePolls.map((d) => d[aggregator])),
                ]),
            );

            return {
                candidate,
                ...aggregatorData,
                avg: d3.mean(aggregators.map((p) => aggregatorData[p])),
            } as CandidateData;
        });
        return {
            ...Object.fromEntries( candidateData.map((d) => [d.candidate, d]) ),
            date,
        } as DayData;
    });
    
    return dailyCandidateData;
}

export { getPollData, prepareData, aggregators };
