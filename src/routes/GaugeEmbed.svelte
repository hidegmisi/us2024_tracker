<script lang="ts">
    import CandidateStanding from "../components/CandidateStanding.svelte";
    import { onMount } from "svelte";
    import type { PollData } from "../lib/types";
    import { fetchPollData, pollData } from "../stores/dataStore";

    export let repo: string;

    let data: PollData = {
        demLead: null,
        dailyData: [],
    };

    onMount(async () => {
        await fetchPollData(repo);
    });

    $: data = $pollData;
</script>
  
<article>
    <div class="chartContainer">
        <CandidateStanding />
    </div>
</article>

<style lang="scss">
article {
    display: flex;
    justify-content: center;

    padding: 6px;
    border-top: 1px solid blue;
    border-left: 1px solid blue;
    border-right: 1px solid red;
    border-bottom: 1px solid red;

    .chartContainer {
        width: 100%;
        margin: 1rem;
    }
}
</style>
