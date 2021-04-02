<script>
    export let label;
</script>

<style>
    div {
        margin-top: 72px;
    }
    .label {
		font-family: IBM Plex Mono;
		font-style: normal;
		font-weight: normal;
		font-size: 18px;
		letter-spacing: 0.13em;
		text-transform: uppercase;
        margin: 4px 0;
	}
</style>

<div>
    {#if label}
        <h3 class="reduced label">{label}</h3>
    {/if}
    <slot></slot>
</div>