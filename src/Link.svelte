<script>
    export let label;
    export let url;
    export let lineBreak = true;
</script>

<style>
    a {
        display: inline-block;
        align-items: center;
        margin-bottom: 8px;
        cursor: pointer;
        vertical-align: middle;
    }

    a span {
        margin-right: 4px;
        color: var(--text-color);
        vertical-align: middle;
    }

    a:hover {
        text-decoration: none;
    }

    svg {
        display:inline;
        vertical-align: middle;
    }

    a:hover span {
        animation: rainbow-text 8s infinite;
        text-decoration-color: var(--text-color);
        box-shadow: 0px 2px 0px 0px rgba(0,0,0,0);
    }

    @keyframes rainbow-text {
        12.5% {color: #04ff00; box-shadow: 0px 2px 0px 0px #04ff00}
        25% {color: #00ffff; box-shadow: 0px 2px 0px 0px #00ffff}
        37.5% {color: #0008ff; box-shadow: 0px 2px 0px 0px #0008ff}
        50% {color: #aa00ff; box-shadow: 0px 2px 0px 0px #aa00ff}
        62.5% {color: #ff00a2; box-shadow: 0px 2px 0px 0px #ff00a2}
        75% {color:#ff1100; box-shadow: 0px 2px 0px 0px #ff1100}
        87.5% {color: #ff8c00; box-shadow: 0px 2px 0px 0px #ff8c00}
        100% {color: #ffd500; box-shadow: 0px 2px 0px 0px #ffd500}
    }
</style>

<a href={url} target="_blank">
    <span>{label}</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 13 13">
        <path fill="var(--text-secondary-color)" fill-rule="evenodd" d="M7.917 1.333a.5.5 0 110-1h4.25a.5.5 0 01.5.5v4.25a.5.5 0 01-1 0V2.04l-6.23 6.23a.5.5 0 01-.707-.707l6.23-6.23H7.917zm-7.022.978c.36-.359.847-.561 1.355-.561h2.833a.5.5 0 110 1H2.25a.917.917 0 00-.917.917v7.083a.917.917 0 00.917.917h7.083a.917.917 0 00.917-.917V7.917a.5.5 0 011 0v2.833a1.917 1.917 0 01-1.917 1.917H2.25A1.916 1.916 0 01.333 10.75V3.667c0-.509.202-.996.562-1.356z" clip-rule="evenodd"/>
     </svg>
</a>
{#if lineBreak == true}
    <br/>
{/if}