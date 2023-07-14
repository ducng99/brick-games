<script lang="ts">
    import { onMount } from 'svelte';
    import Renderer from './libs/Renderer.svelte';
    import Sidebar from './libs/Sidebar.svelte';
    import { RendererInstanceStore, rendererWidthStore, rendererHeightStore } from './stores/RendererStore';
    import { RendererMiniInstanceStore } from './stores/RendererMiniStore';
    import type Brain from './games/libs/Brain';
    import { addOnKeyDownListener, removeOnKeyDownListener } from './libs/KeyboardHandler';
    import GamesList, { CurrentGameId } from './games/GamesList';
    import GameMenu from './games/GameMenu';
    import { debugMode } from './stores/SettingsStore';
    import SplashScreen from './games/SplashScreen';
    import type { Callable } from './libs/utils';
    import { cancelablePromise, CanceledPromiseError, type CancelablePromise } from './libs/utils/CancelablePromise';

    let sidebar: Sidebar;
    let additionalCSS = '';
    let animationFrameNumber = 0;
    let game: Brain | null = null;
    let gameLoadPromise: CancelablePromise<Callable<Brain>> | null = null;

    $: gameScore = game?.score;

    $: loadNewGame($CurrentGameId);

    $: {
        game?.start();

        if (game?.update) {
            animationFrameNumber = requestAnimationFrame(processFrame);
        }
    }

    $: {
        if ($rendererWidthStore && $rendererHeightStore && sidebar) {
            updateAdditionalCSS();
        }
    }

    onMount(() => {
        game = new SplashScreen();

        const restartGame = addOnKeyDownListener('KeyR', () => {
            loadNewGame($CurrentGameId);
        });

        const escapeToGameMenu = addOnKeyDownListener('Escape', () => {
            stopGame();
        });

        const logBricksCallback = addOnKeyDownListener('KeyL', () => {
            $RendererInstanceStore?.logBricks();
        });

        const clearScreenCallback = addOnKeyDownListener('KeyC', () => {
            $RendererInstanceStore?.clearScreen();
        });

        window.addEventListener('resize', updateAdditionalCSS);

        return () => {
            removeOnKeyDownListener('KeyR', restartGame);
            removeOnKeyDownListener('Escape', escapeToGameMenu);
            removeOnKeyDownListener('KeyL', logBricksCallback);
            removeOnKeyDownListener('KeyC', clearScreenCallback);
            window.removeEventListener('resize', () => updateAdditionalCSS);
            stopGame(false);
        };
    });

    function loadNewGame(id: string) {
        if (id in GamesList) {
            stopGame(false);

            gameLoadPromise = cancelablePromise(GamesList[id].loader());
            gameLoadPromise.promise.then(Game => {
                game = new Game();
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
            game = new GameMenu();
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

    function updateAdditionalCSS() {
        if (sidebar) {
            const padding = sidebar.getWidth();
            const rendererRatio = $rendererWidthStore / $rendererHeightStore;
            additionalCSS = (window.innerWidth - padding) / window.innerHeight <= rendererRatio ? 'height: auto; width: 90%; font-size: 1vw' : 'font-size: 1.4vmin;';
        }
    }
</script>

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
