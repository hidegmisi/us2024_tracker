import { writable } from 'svelte/store';
import { getPollData, prepareData } from '../lib/dataUtils';
import type { DayData, PollData } from '../lib/types';

export const pollData = writable<PollData>({
    dailyData: [],
    demLead: null,
});

export const dynamicDayData = writable<DayData>({
    date: '',
    Trump: {
        candidate: "Trump",
        avg: 0,
        fivethirtyeight: undefined,
        realclearpolling: undefined,
        natesilver: undefined,
        nyt: undefined,
    },
    Harris: {
        candidate: "Harris",
        avg: 0,
        fivethirtyeight: undefined,
        realclearpolling: undefined,
        natesilver: undefined,
        nyt: undefined,
    },
});

export async function fetchPollData(repo: string) {
    try {
        const data = await getPollData(repo);
        if (!data) {
            throw new Error('Could not import data.');
        }
        
        const dailyData = prepareData(data);
        const lastDay = dailyData[dailyData.length - 1];
        const demLead = calculateDemLead(lastDay);

        pollData.set({
            dailyData,
            demLead,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        pollData.set({
            dailyData: [],
            demLead: null,
        });
    }
}

export function calculateDemLead(day: DayData): number {    
    return parseFloat((day.Harris.avg - day.Trump.avg).toFixed(5));
}
