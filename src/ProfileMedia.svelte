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
<video bind:this={video} poster="https://firebasestorage.googleapis.com/v0/b/jonlehman-me.appspot.com/o/JonLehman_Profile_Poster.jpg?alt=media&token=9772bb4d-d556-40b8-9ad9-9144ecccb940" autoplay="true" controls="false" preload='metadata' muted loop playsinline>
    <source src="https://firebasestorage.googleapis.com/v0/b/jonlehman-me.appspot.com/o/JonLehman_Profile_SHORT.webm?alt=media&token=91776b1f-fdcd-4ade-ae2e-f02ad16c717d" type="video/webm"/>
    <source src="https://firebasestorage.googleapis.com/v0/b/jonlehman-me.appspot.com/o/JonLehman_Profile_SHORT.mp4?alt=media&token=83658efd-3d83-45a4-a749-904311838e48" type="video/mp4"/>
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src="https://firebasestorage.googleapis.com/v0/b/jonlehman-me.appspot.com/o/JonLehman_Profile_Fallback.jpg?alt=media&token=3aff2d02-9c05-484f-94a7-a8dc4d8f5c09"/>
</video>