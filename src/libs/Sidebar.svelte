<script lang="ts">
    import { clamp, pad } from './Utils';
    import Renderer from './Renderer.svelte';
    import { bricks, width, height, RendererMiniInstance } from '../stores/RendererMiniStore';

    export let score: number | undefined;

    $: scoreText = pad(pad(clamp(score ?? 0, 0, 999999), 3), 6, '!');
</script>

<div id="sidebar">
    <div id="score">{scoreText}</div>
    <div class="text">SCORE
        <span id="soundIcon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-music-note-beamed" viewBox="0 0 16 16">
                <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/>
                <path fill-rule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z"/>
                <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z"/>
            </svg>
        </span>
    </div>
    <div id="rendererMini">
        <Renderer bricks={$bricks} width={$width} height={$height} border={false} bind:this={$RendererMiniInstance} />
    </div>
</div>

<style lang="scss">
    #sidebar {
        padding-left: calc(var(--game-block-size) / 2);
    }

    #score {
        font-family: 'DSEG';
        font-size: calc(var(--game-block-size) * 1.5);
        text-align: right;
        width: 100%;
    }

    .text {
        font-family: 'JetbrainsMono';
        font-size: 2em;
        font-weight: bold;
        margin: 1em 0;

        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    #soundIcon {
        margin: 0 0.5em;
        display: flex;
    }

    #rendererMini {
        display: flex;
        justify-content: center;
    }
</style>
