<script lang="ts">
    import { onMount } from 'svelte';
    import Renderer from './libs/Renderer.svelte';
    import Sidebar from './libs/Sidebar.svelte';
    import { RendererInstanceStore, rendererWidthStore, rendererHeightStore } from './stores/RendererStore';
    import { RendererMiniInstanceStore } from './stores/RendererMiniStore';
    import type Brain from './games/libs/Brain';
    import { addOnKeyDownListener, removeOnKeyDownListener } from './libs/KeyboardHandler';
    import GamesList, { CurrentGameId, CurrentGameVariant } from './games/GamesList';
    import GameMenu from './games/GameMenu';
    import { debugMode } from './stores/SettingsStore';
    import SplashScreen from './games/SplashScreen';
    import type { Callable } from './libs/utils';
    import { cancelablePromise, CanceledPromiseError, type CancelablePromise } from './libs/utils/CancelablePromise';
    import { GamepadStandardButton, addGamepadButtonDownListener, removeGamepadButtonDownListener, updateGamepads } from './libs/GamepadHandler';

    let windowWidth = 0;
    let windowHeight = 0;

    let sidebar: Sidebar;
    let additionalCSS = '';
    let animationFrameNumber = 0;
    let game: Brain | null = null;
    let gameLoadPromise: CancelablePromise<Callable<Brain, [gameID: string]>> | null = null;

    $: gameScore = game?.score;

    // Restart game when width & height change as game starts before new size is applied
    $: {
        if ($rendererWidthStore && $rendererHeightStore) {
            loadNewGame($CurrentGameId, $CurrentGameVariant);
        }
    }

    $: {
        game?.start();

        if (game?.update) {
            animationFrameNumber = requestAnimationFrame(processFrame);
        }
    }

    $: {
        if (sidebar) {
            const padding = sidebar.getWidth();
            const rendererRatio = $rendererWidthStore / $rendererHeightStore;
            additionalCSS = (windowWidth - padding) / windowHeight <= rendererRatio ? 'height: auto; width: 90%; font-size: 1vw' : 'font-size: 1.4vmin;';
        }
    }

    onMount(() => {
        game = new SplashScreen('splash-screen');

        const restartGame = addOnKeyDownListener('KeyR', () => {
            loadNewGame($CurrentGameId, $CurrentGameVariant);
        });

        const escapeToGameMenu = addOnKeyDownListener('Escape', () => {
            stopGame();
        });

        const escapeToGameMenuGamepad = addGamepadButtonDownListener(GamepadStandardButton.Start, () => {
            stopGame();
        });

        const logBricksCallback = addOnKeyDownListener('KeyL', () => {
            $RendererInstanceStore?.logBricks();
        });

        const clearScreenCallback = addOnKeyDownListener('KeyC', () => {
            $RendererInstanceStore?.clearScreen();
        });

        return () => {
            removeOnKeyDownListener('KeyR', restartGame);
            removeOnKeyDownListener('Escape', escapeToGameMenu);
            removeGamepadButtonDownListener(GamepadStandardButton.Start, escapeToGameMenuGamepad);
            removeOnKeyDownListener('KeyL', logBricksCallback);
            removeOnKeyDownListener('KeyC', clearScreenCallback);
            stopGame(false);
        };
    });

    function loadNewGame(id: string, variant: number) {
        if (id in GamesList && variant >= 0 && variant < GamesList[id].length) {
            stopGame(false);

            gameLoadPromise = cancelablePromise(GamesList[id][variant].loader());
            gameLoadPromise.promise.then(Game => {
                game = new Game(id);
            }).catch((ex) => {
                if (!(ex instanceof CanceledPromiseError)) {
                    console.error('Failed to load game.');
                }
            });
        }
    }

    function processFrame(timestamp: DOMHighResTimeStamp) {
        if (game?.state === 'stopped') {
            stopGame(!(game instanceof GameMenu));
        } else {
            updateGamepads();

            if (game?.update) {
                if (!$debugMode) {
                    game?.update(timestamp);
                }
            }

            animationFrameNumber = requestAnimationFrame(processFrame);
        }
    }

    function stopGame(loadMenu = true) {
        gameLoadPromise?.cancel();

        if (game?.stop && game.state !== 'stopped') {
            cancelAnimationFrame(animationFrameNumber);
            game.stop();
        }

        if (loadMenu) {
            $CurrentGameId = '';
            game = new GameMenu('game-menu');
        }

        // On unmount the instance exists but not the props,
        // hence checking function exists
        if ($RendererInstanceStore?.clearScreen) {
            $RendererInstanceStore.clearScreen();
        }

        if ($RendererMiniInstanceStore?.clearScreen) {
            $RendererMiniInstanceStore.clearScreen();
        }
    }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<main>
    <div style={additionalCSS}>
        <Renderer width={$rendererWidthStore} height={$rendererHeightStore} bind:this={$RendererInstanceStore} />
        <Sidebar score={$gameScore} bind:this={sidebar} />
    </div>
</main>

<style lang="scss">
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

        height: 90%;
        width: auto;
        max-height: 90%;
        max-width: 90%;
    }
</style>
