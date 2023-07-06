<script lang="ts">
    import { onMount } from 'svelte';
    import Renderer from './libs/Renderer.svelte';
    import Sidebar from './libs/Sidebar.svelte';
    import { RendererInstance, width, height } from './stores/RendererStore';
    import type Brain from './games/libs/Brain';
    import { addOnKeyDownListener, removeOnKeyDownListener } from './libs/KeyboardHandler';
    import GamesList, { CurrentGameId } from './games/GamesList';
    import GameMenu from './games';
    import { debugMode } from './stores/SettingsStore';

    let game: Brain | null = null;
    $: gameScore = game?.score;

    $: loadNewGame($CurrentGameId);

    $: {
        game?.start();

        if (game?.update) {
            requestAnimationFrame(processFrame);
        }
    }

    onMount(() => {
        game = new GameMenu();

        const restartGame = addOnKeyDownListener('KeyR', () => {
            loadNewGame($CurrentGameId);
        });

        const logBricksCallback = addOnKeyDownListener('KeyL', () => {
            $RendererInstance?.logBricks();
        });

        const clearScreenCallback = addOnKeyDownListener('KeyC', () => {
            $RendererInstance?.clearScreen();
        });

        return () => {
            removeOnKeyDownListener('KeyR', restartGame);
            removeOnKeyDownListener('KeyL', logBricksCallback);
            removeOnKeyDownListener('KeyC', clearScreenCallback);
            stopGame();
        };
    });

    function loadNewGame(id: string) {
        stopGame(false);

        if (id in GamesList) {
            GamesList[id].loader().then(Game => {
                game = new Game();
            }).catch(() => {
                console.error('Failed to load game.');
            });
        }
    }

    function processFrame() {
        if (game?.update) {
            if (game?.state === 'stopped') {
                stopGame(!(game instanceof GameMenu));
            } else {
                if (!$debugMode) {
                    game?.update();
                }

                requestAnimationFrame(processFrame);
            }
        }
    }

    function stopGame(loadMenu = true) {
        if (game?.stop && game.state !== 'stopped') {
            game.stop();
        }

        if (loadMenu) {
            game = new GameMenu();
            $CurrentGameId = '';
        }

        // On unmount the instance exists but not the props,
        // hence checking function exists
        if ($RendererInstance?.clearScreen) {
            $RendererInstance.clearScreen();
        }
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
