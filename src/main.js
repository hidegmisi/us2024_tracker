import App from './App.svelte';
import './lib/style/_global-imports.scss';

const app = new App({
	target: document.body,
	props: {
		repo: 'hidegmisi/us2024_aggregator_scraper'
	},
	customElement: true,
});

export default app;