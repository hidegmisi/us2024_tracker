import * as d3 from "d3";
import type { CandidateData, DayData, RawData } from "./types";

const aggregatorImportNameMap = {
    '538': 'fivethirtyeight',
    'NS': 'natesilver',
    'NYT': 'nyt',
    'RCP': 'realclearpolling',
    'Economist': 'economist',
}

const aggregatorNameMap: { [key in keyof Omit<CandidateData, 'candidate' | 'date' | 'avg'>]: {abv: string, full: string, link: string} } = {
    fivethirtyeight: {abv: "538", full: "538 (ABC News)", link: "https://projects.fivethirtyeight.com/polls/president-general/2024/national/"},
    natesilver: {abv: "Nate Silver", full: "Silver Bulletin", link: "https://www.natesilver.net/p/we-removed-rfk-jr-from-our-model"},
    nyt: {abv: "NYT", full: "New York Times", link: "https://www.nytimes.com/interactive/2024/us/elections/polls-president.html"},
    realclearpolling: {abv: "RCP", full: "RealClear Politics", link: "https://www.realclearpolling.com/polls/president/general/2024/trump-vs-harris"},
    economist: {abv: "Economist", full: "The Economist", link: "https://www.economist.com/interactive/us-2024-election/trump-harris-polls"},
};

const aggregators = Object.keys(aggregatorNameMap) as (keyof typeof aggregatorNameMap)[];

async function fetchPollData(repo: string): Promise<RawData[]> {
    const response = await fetch(
        `https://api.github.com/repos/${repo}/contents/daily_aggregates.csv`,
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

    const dates = Array.from(new Set(data.map((d) => d.date))).slice(3);
    dates.sort();

    const dailyData = dates.map((date) => {
        const dateData = data.filter((d) => d.date === date);
        const candidateData = candidates.map((candidate) => {
            const candidateDateData = dateData.filter(
                (d) => d.candidate === candidate,
            );
            
            const aggregatorData = Object.fromEntries(
                candidateDateData.map((d) => [(d.aggregator == 'Average') ? 'avg' : aggregatorImportNameMap[d.aggregator], d.value]),
            );

            return {
                candidate,
                ...aggregatorData,
            } as CandidateData;
        });
        return {
            ...Object.fromEntries(candidateData.map((d) => [d.candidate, d])),
            date,
        } as DayData;
    });

    return dailyData;

   /*  const dailyCandidateData = dates.map((date) => {
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
    }); */
}

export { getPollData, prepareData, aggregators, aggregatorNameMap };
