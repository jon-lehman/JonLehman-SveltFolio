<script>
    import { onMount } from 'svelte';
    let video;

    onMount(() => {
        // Removes video controls on iOS
        video.controls = false;
    });
</script>

<style>
    video {
        width: 100%;
        margin-top: 72px;
    }
    video::-webkit-media-controls {
        display: none;
    }
    @media (max-width: 520px) {
        video {
            margin-top:24px;
        }
    }
</style>

<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={video} poster="assets/JonLehman_Profile_Poster.jpg" autoplay="true" controls="false" preload='metadata' muted loop playsinline>
    <source src="assets/JonLehman_Profile_SHORT.webm" type="video/webm"/>
    <source src="assets/JonLehman_Profile_SHORT.mp4" type="video/mp4"/>
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src="assets/JonLehman_Profile_Fallback.jpg"/>
</video>