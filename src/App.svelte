<script lang="ts">
    import { onMount } from 'svelte';
    import Renderer from './libs/Renderer.svelte';
    import Sidebar from './libs/Sidebar.svelte';
    import { RendererInstance } from './stores/RendererStore';
    import type Brain from './games/libs/Brain';
    import { addOnKeyDownListener, removeOnKeyDownListener } from './libs/KeyboardHandler';
    import { get } from 'svelte/store';

    let game: Brain | null = null;
    const currentGameId: string = 'car-racing';

    $: {
        selectGame(currentGameId);
    }

    $: {
        game?.start();

        if (game?.update) {
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

    function selectGame(id: string) {
        stopGame();

        import('./games/GamesList').then(list => {
            list.default.find(game => game.id === id)?.loader().then(_ => {
                game = new _.default();
            }).catch(() => console.error('Failed to load game.'));
        }).catch(() => console.error('Failed to load games list.'));
    }

    function processFrame() {
        if (game?.update) {
            if (game.state === 'stopped') {
                stopGame();
                return;
            }

            game.update();

            requestAnimationFrame(processFrame);
        }
    }

    function restartGame() {
        selectGame(currentGameId);
    }

    function stopGame() {
        if (game?.stop && game.state !== 'stopped') {
            game.stop();
        }

        game = null;

        get(RendererInstance)?.clearScreen();
    }
</script>

<main>
    <div>
        <Renderer bind:this={$RendererInstance} />
        <Sidebar score={game?.score}/>
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
