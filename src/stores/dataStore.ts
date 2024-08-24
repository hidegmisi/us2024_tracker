import { writable } from 'svelte/store';
import { getPollData, prepareData } from '../lib/dataUtils';
import type { PollData } from '../lib/types';

export const pollData = writable<PollData>({
    dailyData: [],
    demLead: null,
});

export async function fetchPollData(repo: string) {
    try {
        const data = await getPollData(repo);
        if (!data) {
            throw new Error('Could not import data.');
        }
        
        const dailyData = prepareData(data);
        const demLead = calculateDemLead(dailyData);

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

function calculateDemLead(dailyData: any[]): number {    
    const lastDay = dailyData[dailyData.length - 1];
    return parseFloat((lastDay.Harris.avg - lastDay.Trump.avg).toFixed(5));
}
