import * as d3 from "d3";

const aggregators = [
    "fivethirtyeight",
    "realclearpolling",
    "natesilver",
    "nyt",
];

async function fetchPollData(repo) {
    const response = await fetch(
        `https://api.github.com/repos/${repo}/contents/polls.csv`,
    );
    const json = await response.json();
    const csvData = atob(json.content);
    return d3.csvParse(csvData);
}

function isDataStale() {
    const oneHour = 1000 * 60 * 60;
    const now = new Date();
    const lastUpdated = new Date(
        sessionStorage.getItem("pollsDataUpdated"),
    );
    const diff = now - lastUpdated;

    return (
        sessionStorage.getItem("pollsData") == null ||
        sessionStorage.getItem("pollsDataUpdated") == null ||
        diff >= oneHour
    );
}

async function getPollData(repo) {
    if (isDataStale()) {
        const pollData = await fetchPollData(repo);
        const now = new Date();
        sessionStorage.setItem("pollsData", JSON.stringify(pollData));
        sessionStorage.setItem("pollsDataUpdated", now);
        return pollData;
    } else {
        return JSON.parse(sessionStorage.getItem("pollsData"));
    }
}

function prepareData(data) {
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
                aggregators.map((p) => [
                    p,
                    d3.mean(candidatePolls.map((d) => d[p])),
                ]),
            );

            return {
                candidate,
                date,
                ...aggregatorData,
                avg: d3.mean(aggregators.map((p) => aggregatorData[p])),
            };
        });
        return Object.fromEntries(
            candidateData.map((d) => [d.candidate, d]),
        );
    });

    const dailyCandidateAgg = dailyCandidateData.map((d) => {
        const trump = d.Trump;
        const harris = d.Harris;

        return {
            date: trump.date,
            Trump: d3.mean(aggregators.map((p) => trump[p])).toFixed(4),
            Harris: d3.mean(aggregators.map((p) => harris[p])).toFixed(4),
        };
    });

    return {
        dailyAggData: dailyCandidateAgg,
        dailyData: dailyCandidateData,
    };
}

export { getPollData, prepareData, aggregators };
