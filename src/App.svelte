<script lang="ts">
    import { onMount } from 'svelte';
    import Renderer from './libs/Renderer.svelte';
    import Sidebar from './libs/Sidebar.svelte';
    import { RendererInstance, width, height } from './stores/RendererStore';
    import type Brain from './games/libs/Brain';
    import { addOnKeyDownListener, removeOnKeyDownListener } from './libs/KeyboardHandler';
    import GamesList, { CurrentGameId } from './games/GamesList';
    import GameMenu from './games';

    const gameMenu = new GameMenu();

    let game: Brain = gameMenu;
    $: gameScore = game.score;

    $: loadNewGame($CurrentGameId);

    $: {
        game.start();

        if (game.update) {
            requestAnimationFrame(processFrame);
        }
    }

    onMount(() => {
        addOnKeyDownListener('KeyR', restartGame);

        return () => {
            removeOnKeyDownListener('KeyR', restartGame);
            stopGame();
        };
    });

    function loadNewGame(id: string) {
        stopGame();

        if (id in GamesList) {
            GamesList[id].loader().then(_ => {
                game = new _.default();
            }).catch(() => console.error('Failed to load game.'));
        }
    }

    function processFrame() {
        if (game.update) {
            if (game.state === 'stopped') {
                stopGame();
                return;
            }

            game.update();

            requestAnimationFrame(processFrame);
        }
    }

    function restartGame() {
        loadNewGame($CurrentGameId);
    }

    function stopGame() {
        if (game.stop && game.state !== 'stopped') {
            game.stop();
        }

        if ($RendererInstance?.clearScreen) {
            $RendererInstance.clearScreen();
        }

        game = gameMenu;
    }
</script>

<main>
    <div>
        <Renderer width={$width} height={$height} bind:this={$RendererInstance} />
        <Sidebar score={$gameScore} />
    </div>
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    div {
        display: flex;
        background-color: var(--game-bg);
        padding: 1em;
        box-shadow: inset 0 0 0.2em 0 black;
    }
</style>
