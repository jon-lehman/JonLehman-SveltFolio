<script>
	import {data} from './data.js';
	import Section from './Section.svelte';
	import Link from './Link.svelte';
	import ProfileMedia from './ProfileMedia.svelte';
	import Title from './Title.svelte';
	import { init, track, parameters } from "insights-js"
	
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  		document.body.classList.add('dark-mode');
	}
	//Get Insights Analtyics
	init("aBcSgrqnvPnJ1Nuy");
</script>

<style>
	/*Light Styles*/
	:global(body) {
		--text-color: #111112;
		--text-secondary-color: #646464;
		--background-color: #F9F9F9;
	}
	/*dark styles*/
	:global(body.dark-mode) {
		--text-color: #FFFFFF;
		--text-secondary-color: #C2C2C2;
		--background-color: #111112;
	}
	/*general styles*/
	:global(body) {
		height: auto;
		display: flex;
		justify-content: center;
		background-color: var(--background-color);
		color: var(--text-color);
		font-family: IBM Plex Sans;
		font-size: 18px;
		line-height: 160%;
		-webkit-font-smoothing: antialiased;
		padding: 16px;
	}
	:global(.reduced) {
		color: var(--text-secondary-color);
	}
	p {
		margin: 0 0 4px 0;
	}
	.container {
		height: auto;
		width: 100%;
		max-width: 520px;
		margin-bottom: 200px;
	}
	.sticky {
        background-color: var(--background-color);
        position: -webkit-sticky;
        position: sticky;
        bottom: 0;
		padding: 16px 0 32px 0;
		margin-bottom: -32px;
    }
</style>

<svelte:head>
	<title>Jon Lehman</title>
	<html lang="en" />
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="container">
	
	<ProfileMedia />

	<div class="sticky">
		<Title />
	</div>

	<Section label={"About"}>
		<p>{data.about.text}</p>
	</Section>

	<Section label={"Currently"}>
		<p>{data.currentJob.text}</p>
	</Section>

	<Section label={"Previously"}>
		<p>{data.previousJob.text}</p>
	</Section>

	<Section label={"Personal Projects"}>
		{#each data.projects as project}
			<Link label={project.text} url={project.link}/>
		{/each}
	</Section>

	<Section label={"Notes"}>
		{#each data.notes as note}
			<Link label={note.text} url={note.link}/>
		{/each}
	</Section>

	<Section label={"Socials"}>
		{#each data.socials as social}
			<Link label={social.text} url={social.link} lineBreak={true}/>
		{/each}
	</Section>

</div>