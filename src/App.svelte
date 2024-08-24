<script>
    import { onMount } from 'svelte';
    import page from 'page';

    import Home from './routes/Home.svelte';
    import ChartEmbed from './routes/ChartEmbed.svelte';
    import NotFound from './routes/NotFound.svelte';

    export let repo;

    let currentComponent;

    function routeHandler(component) {
        return function() {
            currentComponent = component;
        }
    }

    onMount(() => {
        page.base(window.location.pathname);
        page('/', routeHandler(Home));
        page('#/home', routeHandler(Home));
        page('#/embed/chart', routeHandler(ChartEmbed));
        page('*', routeHandler(NotFound));
        page.start({ hashbang: true });
    });
</script>

<svelte:component this={currentComponent} {repo} />
