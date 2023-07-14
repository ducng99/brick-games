<script lang="ts">
    import Renderer from './Renderer.svelte';
    import { RendererMiniInstanceStore, rendererMiniHeight, rendererMiniWidth } from '../stores/RendererMiniStore';
    import GamesList from '../games/GamesList';
    import { MenuCurrentSelectGameId } from '../games/GameMenu';
    import { pad } from './utils';

    export let score: string | undefined;
    let width: number;

    export function getWidth() {
        return width;
    }
</script>

<div id="sidebar" bind:clientWidth={width}>
    <div id="score">{pad(score ?? '000', 6, '!')}</div>
    <div id="scoreLabel" class="text">SCORE
        <span id="soundIcon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-music-note-beamed" viewBox="0 0 16 16">
                <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/>
                <path fill-rule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z"/>
                <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z"/>
            </svg>
        </span>
    </div>
    <div id="rendererMini">
        <div>
            <Renderer width={rendererMiniWidth} height={rendererMiniHeight} border={false} bind:this={$RendererMiniInstanceStore} />
        </div>
    </div>
    <div id="currentGameName" class="text">
        {#if $MenuCurrentSelectGameId in GamesList}
            {GamesList[$MenuCurrentSelectGameId].name}
        {:else}
            Game over
        {/if}
    </div>
</div>

<style lang="scss">
    #sidebar {
        display: flex;
        flex-direction: column;
        padding-left: 1.5em;
    }

    #score {
        font-family: 'DSEG';
        font-size: 4.2em;
        text-align: right;
        width: 100%;
    }

    .text {
        font-family: 'JetbrainsMono';
        font-size: 2em;
        font-weight: bold;
        text-transform: uppercase;
    }

    #scoreLabel {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin: 1em 0;
    }

    #soundIcon {
        margin: 0 0.5em;
        display: flex;
    }

    #rendererMini {
        display: flex;
        justify-content: center;

        div {
            width: 12em;
        }
    }

    #currentGameName {
        margin-top: auto;
        text-align: center;
    }
</style>
