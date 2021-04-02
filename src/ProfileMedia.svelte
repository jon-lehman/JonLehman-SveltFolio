<style>
    video {
        width: 100%;
    }
    video::-webkit-media-controls {
        display: none;
    }
</style>

<!-- svelte-ignore a11y-media-has-caption -->
<video  autoplay="autoplay" controls="false" muted loop>
    <source src="assets/JonLehman_Profile_SMALL.webm" type="video/webm" />
    <source src="assets/JonLehman_Profile_SMALL.mp4" type="video/mp4" />
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src="assets/JoneLehman_Profile_Poster.png" />
</video>