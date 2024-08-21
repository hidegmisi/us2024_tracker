<script>
    import { onMount } from 'svelte';
    import page from 'page';

    import Home from './routes/Home.svelte';
    import ChartEmbed from './routes/ChartEmbed.svelte';
    import NotFound from './routes/NotFound.svelte';

    let repo = 'hidegmisi/us2024_aggregator_scraper';

    let currentComponent;

    function routeHandler(component) {
        return function() {
            currentComponent = component;
        }
    }

    onMount(() => {
        page('/', routeHandler(Home));
        page('/embed/chart', routeHandler(ChartEmbed));
        page('*', routeHandler(NotFound));
        page.start();
    });
</script>

<svelte:component this={currentComponent} {repo} />
