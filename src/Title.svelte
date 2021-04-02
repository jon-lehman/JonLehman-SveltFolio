<script>
    import {data} from './data.js';
</script>

<style>
    h1 {
		font-size: 2.35em;
		font-weight: 600;
		margin: 12px 0;
	}
	h2 {
		font-size: 1.35em;
		font-weight: 400;
		margin: 12px 0;
	}
    div {
        background-color: var(--background-color);
        position: -webkit-sticky;
        position: sticky;
        top: 0;
    }
</style>

<div>
    <h1>{data.title.name}</h1>
    <h2 class="reduced">{data.title.subtitle}</h2>
</div>